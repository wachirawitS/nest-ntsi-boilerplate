import 'dotenv/config';
import * as argon2 from 'argon2';
import { In } from 'typeorm';
import dataSource from '../configs/typeorm.config';
import { PermissionEntity } from '../modules/identity/domain/entities/permission.entity';
import { RolePermissionEntity } from '../modules/identity/domain/entities/role-permission.entity';
import { RoleEntity } from '../modules/identity/domain/entities/role.entity';
import { UserCredentialEntity } from '../modules/identity/domain/entities/user-credential.entity';
import { UserRoleEntity } from '../modules/identity/domain/entities/user-role.entity';
import { UserEntity } from '../modules/identity/domain/entities/user.entity';
import { permissionRegistry } from '../modules/permissions.registry';

const systemRoles = [
  { key: 'admin', name: 'Administrator' },
  { key: 'member', name: 'Member' },
] as const;

async function seedIdentity(): Promise<void> {
  await dataSource.initialize();

  try {
    await dataSource.transaction(async (manager) => {
      const permissions = manager.getRepository(PermissionEntity);
      const roles = manager.getRepository(RoleEntity);
      const rolePermissions = manager.getRepository(RolePermissionEntity);
      const users = manager.getRepository(UserEntity);
      const credentials = manager.getRepository(UserCredentialEntity);
      const userRoles = manager.getRepository(UserRoleEntity);
      const declaredPermissionKeys = permissionRegistry.map(
        (permission) => permission.key,
      );

      validatePermissionKeys(declaredPermissionKeys);

      for (const declaration of permissionRegistry) {
        const existingPermission = await permissions.findOne({
          where: { key: declaration.key },
        });

        await permissions.save({
          ...(existingPermission ?? {}),
          key: declaration.key,
          description: declaration.description ?? null,
          isActive: true,
          isDeclared: true,
        });
      }

      const stalePermissions = await permissions.find({
        where: { key: In(await findStalePermissionKeys(permissions)) },
      });

      for (const stalePermission of stalePermissions) {
        stalePermission.isActive = false;
        stalePermission.isDeclared = false;
        await permissions.save(stalePermission);
      }

      for (const systemRole of systemRoles) {
        const existingRole = await roles.findOne({
          where: { key: systemRole.key },
        });

        await roles.save({
          ...(existingRole ?? {}),
          key: systemRole.key,
          name: systemRole.name,
          isSystem: true,
        });
      }

      const adminRole = await roles.findOneOrFail({ where: { key: 'admin' } });
      const declaredPermissions = await permissions.find({
        where: { key: In(declaredPermissionKeys), isActive: true },
      });
      await rolePermissions.delete({ roleId: adminRole.id });
      await rolePermissions.insert(
        declaredPermissions.map((permission) => ({
          roleId: adminRole.id,
          permissionId: permission.id,
        })),
      );

      const bootstrapEmail = process.env.BOOTSTRAP_ADMIN_EMAIL;
      const bootstrapPassword = process.env.BOOTSTRAP_ADMIN_PASSWORD;

      if (bootstrapEmail || bootstrapPassword) {
        if (!bootstrapEmail || !bootstrapPassword) {
          throw new Error(
            'BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD must be set together',
          );
        }

        validatePassword(bootstrapPassword);
        const normalizedEmail = bootstrapEmail.toLowerCase();
        let adminUser = await users.findOne({
          where: { email: normalizedEmail },
        });

        if (!adminUser) {
          adminUser = await users.save(
            UserEntity.create({
              email: normalizedEmail,
              firstName: 'Bootstrap',
              lastName: 'Admin',
            }),
          );
          await credentials.save(
            UserCredentialEntity.create({
              userId: adminUser.id,
              passwordHash: await argon2.hash(bootstrapPassword, {
                type: argon2.argon2id,
              }),
            }),
          );
        }

        const existingAdminAssignment = await userRoles.findOne({
          where: { userId: adminUser.id, roleId: adminRole.id },
        });

        if (!existingAdminAssignment) {
          await userRoles.insert({
            userId: adminUser.id,
            roleId: adminRole.id,
          });
        }
      }
    });
  } finally {
    await dataSource.destroy();
  }
}

async function findStalePermissionKeys(
  permissions: ReturnType<typeof dataSource.getRepository<PermissionEntity>>,
): Promise<string[]> {
  const declared = new Set(
    permissionRegistry.map((permission) => permission.key),
  );
  const existingPermissions = await permissions.find();

  return existingPermissions
    .filter((permission) => !declared.has(permission.key))
    .map((permission) => permission.key);
}

function validatePermissionKeys(permissionKeys: string[]): void {
  const pattern = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*:[a-z][A-Za-z0-9]*$/;
  const invalidPermission = permissionKeys.find((key) => !pattern.test(key));

  if (invalidPermission) {
    throw new Error(`Invalid permission key: ${invalidPermission}`);
  }
}

function validatePassword(password: string): void {
  if (password.length < 12 || password.length > 128) {
    throw new Error('BOOTSTRAP_ADMIN_PASSWORD must be 12-128 characters long');
  }
}

seedIdentity()
  .then(() => {
    console.log('Identity seed completed');
  })
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
