import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../../../shared/cache';
import { EventBus } from '../../../../shared/events';
import { IdentityCacheKeys } from '../cache/identity-cache-keys';
import { PasswordHasher } from '../security/password-hasher';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserCredentialEntity } from '../../domain/entities/user-credential.entity';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { PermissionNotFoundError } from '../../domain/errors/permission-not-found.error';
import { RoleNotFoundError } from '../../domain/errors/role-not-found.error';
import { UserCreatedEvent } from '../../domain/events/user-created.event';
import { UserRolesChangedEvent } from '../../domain/events/user-roles-changed.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roleKeys?: string[];
  directPermissionKeys?: string[];
  createdByUserId?: string | null;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly transaction: IdentityTransaction,
    private readonly events: EventBus,
    private readonly cache: CacheStore,
  ) {}

  async execute(input: CreateUserInput): Promise<UserEntity> {
    const normalizedEmail = input.email.toLowerCase();
    const roleKeys = input.roleKeys ?? [];
    const directPermissionKeys = input.directPermissionKeys ?? [];
    const [roles, directPermissions, existingUser, passwordHash] =
      await Promise.all([
        this.access.findRolesByKeys(roleKeys),
        this.access.findPermissionsByKeys(directPermissionKeys),
        this.users.findByEmail(normalizedEmail),
        this.passwordHasher.hash(input.password),
      ]);

    if (existingUser) {
      throw new UserAlreadyExistsError(normalizedEmail);
    }

    this.assertAllRolesFound(
      roleKeys,
      roles.map((role) => role.key),
    );
    this.assertAllPermissionsFound(
      directPermissionKeys,
      directPermissions.map((permission) => permission.key),
    );

    const user = await this.transaction.run(async () => {
      const savedUser = await this.users.save(
        UserEntity.create({
          ...input,
          email: normalizedEmail,
        }),
      );

      await this.access.saveCredential(
        UserCredentialEntity.create({
          userId: savedUser.id,
          passwordHash,
        }),
      );
      await this.access.replaceUserRoles(
        savedUser.id,
        roles.map((role) => role.id),
      );
      await this.access.replaceUserDirectPermissions(
        savedUser.id,
        directPermissions.map((permission) => permission.id),
      );

      return savedUser;
    });

    await this.cache.set(
      IdentityCacheKeys.userById(user.id),
      {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isActive: user.isActive,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      { ttlMs: 60_000 },
    );

    this.events.publish(
      new UserCreatedEvent({
        userId: user.id,
        email: user.email,
        createdByUserId: input.createdByUserId ?? null,
      }),
    );

    if (roleKeys.length > 0) {
      this.events.publish(
        new UserRolesChangedEvent({
          userId: user.id,
          roleKeys,
          changedByUserId: input.createdByUserId ?? null,
        }),
      );
    }

    return user;
  }

  private assertAllRolesFound(requested: string[], found: string[]): void {
    const missing = requested.find((roleKey) => !found.includes(roleKey));

    if (missing) {
      throw new RoleNotFoundError(missing);
    }
  }

  private assertAllPermissionsFound(
    requested: string[],
    found: string[],
  ): void {
    const missing = requested.find(
      (permissionKey) => !found.includes(permissionKey),
    );

    if (missing) {
      throw new PermissionNotFoundError(missing);
    }
  }
}
