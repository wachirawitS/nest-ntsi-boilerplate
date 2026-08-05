import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { RolePermissionEntity } from '../../domain/entities/role-permission.entity';
import { RoleEntity } from '../../domain/entities/role.entity';
import { SessionEntity } from '../../domain/entities/session.entity';
import { UserCredentialEntity } from '../../domain/entities/user-credential.entity';
import { UserPermissionEntity } from '../../domain/entities/user-permission.entity';
import { UserRoleEntity } from '../../domain/entities/user-role.entity';
import {
  IdentityAccessRepository,
  PrincipalAccess,
} from '../../domain/repositories/identity-access.repository';
import { TypeOrmIdentityTransactionContext } from './typeorm-identity-transaction';

@Injectable()
export class TypeOrmIdentityAccessRepository implements IdentityAccessRepository {
  constructor(
    @InjectRepository(UserCredentialEntity)
    private readonly credentials: Repository<UserCredentialEntity>,
    @InjectRepository(SessionEntity)
    private readonly sessions: Repository<SessionEntity>,
    @InjectRepository(RoleEntity)
    private readonly roles: Repository<RoleEntity>,
    @InjectRepository(PermissionEntity)
    private readonly permissions: Repository<PermissionEntity>,
    @InjectRepository(RolePermissionEntity)
    private readonly rolePermissions: Repository<RolePermissionEntity>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoles: Repository<UserRoleEntity>,
    @InjectRepository(UserPermissionEntity)
    private readonly userPermissions: Repository<UserPermissionEntity>,
    private readonly transactionContext: TypeOrmIdentityTransactionContext,
  ) {}

  private repo<T extends object>(entity: new () => T, fallback: Repository<T>) {
    return this.transactionContext.manager?.getRepository(entity) ?? fallback;
  }

  async findCredentialByUserId(
    userId: string,
  ): Promise<UserCredentialEntity | null> {
    return this.repo(UserCredentialEntity, this.credentials).findOne({
      where: { userId },
    });
  }

  async saveCredential(
    credential: UserCredentialEntity,
  ): Promise<UserCredentialEntity> {
    return this.repo(UserCredentialEntity, this.credentials).save(credential);
  }

  async updateCredentialPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void> {
    await this.repo(UserCredentialEntity, this.credentials).update(
      { userId },
      { passwordHash, passwordChangedAt: new Date() },
    );
  }

  async saveSession(session: SessionEntity): Promise<SessionEntity> {
    return this.repo(SessionEntity, this.sessions).save(session);
  }

  async findSessionById(sessionId: string): Promise<SessionEntity | null> {
    return this.repo(SessionEntity, this.sessions).findOne({
      where: { id: sessionId },
    });
  }

  async updateSessionRefreshSecret(
    sessionId: string,
    refreshTokenSecretHash: string,
  ): Promise<void> {
    await this.repo(SessionEntity, this.sessions).update(
      { id: sessionId },
      { refreshTokenSecretHash, lastUsedAt: new Date() },
    );
  }

  async touchSession(sessionId: string): Promise<void> {
    await this.repo(SessionEntity, this.sessions).update(
      { id: sessionId },
      { lastUsedAt: new Date() },
    );
  }

  async revokeSession(sessionId: string, reason: string): Promise<void> {
    await this.repo(SessionEntity, this.sessions).update(
      { id: sessionId },
      { revokedAt: new Date(), revokedReason: reason },
    );
  }

  async revokeUserSessions(
    userId: string,
    reason: string,
    exceptSessionId?: string,
  ): Promise<void> {
    const query = this.repo(SessionEntity, this.sessions)
      .createQueryBuilder()
      .update(SessionEntity)
      .set({ revokedAt: new Date(), revokedReason: reason })
      .where('user_id = :userId', { userId })
      .andWhere('revoked_at IS NULL');

    if (exceptSessionId) {
      query.andWhere('id != :exceptSessionId', { exceptSessionId });
    }

    await query.execute();
  }

  async findRolesByKeys(roleKeys: string[]): Promise<RoleEntity[]> {
    if (roleKeys.length === 0) {
      return [];
    }

    return this.repo(RoleEntity, this.roles).find({
      where: { key: In(roleKeys) },
    });
  }

  async findPermissionsByKeys(
    permissionKeys: string[],
  ): Promise<PermissionEntity[]> {
    if (permissionKeys.length === 0) {
      return [];
    }

    return this.repo(PermissionEntity, this.permissions).find({
      where: { key: In(permissionKeys), isActive: true, isDeclared: true },
    });
  }

  async replaceUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const userRoles = this.repo(UserRoleEntity, this.userRoles);
    await userRoles.delete({ userId });

    if (roleIds.length > 0) {
      await userRoles.insert(roleIds.map((roleId) => ({ userId, roleId })));
    }
  }

  async replaceUserDirectPermissions(
    userId: string,
    permissionIds: string[],
  ): Promise<void> {
    const userPermissions = this.repo(
      UserPermissionEntity,
      this.userPermissions,
    );
    await userPermissions.delete({ userId });

    if (permissionIds.length > 0) {
      await userPermissions.insert(
        permissionIds.map((permissionId) => ({ userId, permissionId })),
      );
    }
  }

  async replaceRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void> {
    const rolePermissions = this.repo(
      RolePermissionEntity,
      this.rolePermissions,
    );
    await rolePermissions.delete({ roleId });

    if (permissionIds.length > 0) {
      await rolePermissions.insert(
        permissionIds.map((permissionId) => ({ roleId, permissionId })),
      );
    }
  }

  async getPrincipalAccess(userId: string): Promise<PrincipalAccess> {
    const roleRows = await this.repo(UserRoleEntity, this.userRoles)
      .createQueryBuilder('userRole')
      .innerJoin(RoleEntity, 'role', 'role.id = userRole.role_id')
      .where('userRole.user_id = :userId', { userId })
      .select('role.key', 'roleKey')
      .orderBy('role.key', 'ASC')
      .getRawMany<{ roleKey: string }>();

    const rolePermissionRows = await this.repo(UserRoleEntity, this.userRoles)
      .createQueryBuilder('userRole')
      .innerJoin(
        RolePermissionEntity,
        'rolePermission',
        'rolePermission.role_id = userRole.role_id',
      )
      .innerJoin(
        PermissionEntity,
        'permission',
        'permission.id = rolePermission.permission_id',
      )
      .where('userRole.user_id = :userId', { userId })
      .andWhere('permission.is_active = true')
      .andWhere('permission.is_declared = true')
      .select('permission.key', 'permissionKey')
      .getRawMany<{ permissionKey: string }>();

    const directPermissionRows = await this.repo(
      UserPermissionEntity,
      this.userPermissions,
    )
      .createQueryBuilder('userPermission')
      .innerJoin(
        PermissionEntity,
        'permission',
        'permission.id = userPermission.permission_id',
      )
      .where('userPermission.user_id = :userId', { userId })
      .andWhere('permission.is_active = true')
      .andWhere('permission.is_declared = true')
      .select('permission.key', 'permissionKey')
      .getRawMany<{ permissionKey: string }>();

    const permissionKeys = [
      ...rolePermissionRows.map((row) => row.permissionKey),
      ...directPermissionRows.map((row) => row.permissionKey),
    ];

    return {
      roleKeys: roleRows.map((row) => row.roleKey),
      permissionKeys: [...new Set(permissionKeys)].sort(),
    };
  }

  async listPermissions(): Promise<PermissionEntity[]> {
    return this.repo(PermissionEntity, this.permissions).find({
      order: { key: 'ASC' },
    });
  }

  async listRoles(): Promise<RoleEntity[]> {
    return this.repo(RoleEntity, this.roles).find({
      order: { key: 'ASC' },
    });
  }

  async createRole(input: {
    key: string;
    name: string;
    isSystem?: boolean;
  }): Promise<RoleEntity> {
    const role = this.repo(RoleEntity, this.roles).create({
      key: input.key,
      name: input.name,
      isSystem: input.isSystem ?? false,
    });

    return this.repo(RoleEntity, this.roles).save(role);
  }

  async findRoleByKey(roleKey: string): Promise<RoleEntity | null> {
    return this.repo(RoleEntity, this.roles).findOne({
      where: { key: roleKey },
    });
  }

  async updateRole(role: RoleEntity): Promise<RoleEntity> {
    return this.repo(RoleEntity, this.roles).save(role);
  }

  async deleteRole(roleId: string): Promise<void> {
    await this.repo(RoleEntity, this.roles).delete({ id: roleId });
  }

  async countUsersWithRole(roleId: string): Promise<number> {
    return this.repo(UserRoleEntity, this.userRoles).count({
      where: { roleId },
    });
  }
}
