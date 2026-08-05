import { PermissionEntity } from '../entities/permission.entity';
import { RoleEntity } from '../entities/role.entity';
import { SessionEntity } from '../entities/session.entity';
import { UserCredentialEntity } from '../entities/user-credential.entity';

export interface PrincipalAccess {
  roleKeys: string[];
  permissionKeys: string[];
}

export abstract class IdentityAccessRepository {
  abstract findCredentialByUserId(
    userId: string,
  ): Promise<UserCredentialEntity | null>;
  abstract saveCredential(
    credential: UserCredentialEntity,
  ): Promise<UserCredentialEntity>;
  abstract updateCredentialPassword(
    userId: string,
    passwordHash: string,
  ): Promise<void>;

  abstract saveSession(session: SessionEntity): Promise<SessionEntity>;
  abstract findSessionById(sessionId: string): Promise<SessionEntity | null>;
  abstract updateSessionRefreshSecret(
    sessionId: string,
    refreshTokenSecretHash: string,
  ): Promise<void>;
  abstract touchSession(sessionId: string): Promise<void>;
  abstract revokeSession(sessionId: string, reason: string): Promise<void>;
  abstract revokeUserSessions(
    userId: string,
    reason: string,
    exceptSessionId?: string,
  ): Promise<void>;

  abstract findRolesByKeys(roleKeys: string[]): Promise<RoleEntity[]>;
  abstract findPermissionsByKeys(
    permissionKeys: string[],
  ): Promise<PermissionEntity[]>;
  abstract replaceUserRoles(userId: string, roleIds: string[]): Promise<void>;
  abstract replaceUserDirectPermissions(
    userId: string,
    permissionIds: string[],
  ): Promise<void>;
  abstract replaceRolePermissions(
    roleId: string,
    permissionIds: string[],
  ): Promise<void>;
  abstract getPrincipalAccess(userId: string): Promise<PrincipalAccess>;
  abstract listPermissions(): Promise<PermissionEntity[]>;
  abstract listRoles(): Promise<RoleEntity[]>;
  abstract createRole(input: {
    key: string;
    name: string;
    isSystem?: boolean;
  }): Promise<RoleEntity>;
  abstract findRoleByKey(roleKey: string): Promise<RoleEntity | null>;
  abstract updateRole(role: RoleEntity): Promise<RoleEntity>;
  abstract deleteRole(roleId: string): Promise<void>;
  abstract countUsersWithRole(roleId: string): Promise<number>;
}
