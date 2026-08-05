export const IdentityPermissions = {
  UsersCreate: 'users:create',
  UsersRead: 'users:read',
  UsersUpdate: 'users:update',
  UsersDeactivate: 'users:deactivate',
  UsersReactivate: 'users:reactivate',
  UsersRevokeSessions: 'users:revokeSessions',
  UsersManageRoles: 'users:manageRoles',
  UsersManageDirectPermissions: 'users:manageDirectPermissions',
  RolesCreate: 'roles:create',
  RolesRead: 'roles:read',
  RolesUpdate: 'roles:update',
  RolesDelete: 'roles:delete',
  RolesManagePermissions: 'roles:managePermissions',
  PermissionsRead: 'permissions:read',
} as const;

export const identityPermissionCatalog = [
  { key: IdentityPermissions.UsersCreate, description: 'Create users' },
  { key: IdentityPermissions.UsersRead, description: 'Read users' },
  { key: IdentityPermissions.UsersUpdate, description: 'Update users' },
  { key: IdentityPermissions.UsersDeactivate, description: 'Deactivate users' },
  { key: IdentityPermissions.UsersReactivate, description: 'Reactivate users' },
  {
    key: IdentityPermissions.UsersRevokeSessions,
    description: 'Revoke user sessions',
  },
  {
    key: IdentityPermissions.UsersManageRoles,
    description: 'Manage user role assignments',
  },
  {
    key: IdentityPermissions.UsersManageDirectPermissions,
    description: 'Manage direct user permission grants',
  },
  { key: IdentityPermissions.RolesCreate, description: 'Create roles' },
  { key: IdentityPermissions.RolesRead, description: 'Read roles' },
  { key: IdentityPermissions.RolesUpdate, description: 'Update roles' },
  { key: IdentityPermissions.RolesDelete, description: 'Delete roles' },
  {
    key: IdentityPermissions.RolesManagePermissions,
    description: 'Manage role permission grants',
  },
  { key: IdentityPermissions.PermissionsRead, description: 'Read permissions' },
] as const;
