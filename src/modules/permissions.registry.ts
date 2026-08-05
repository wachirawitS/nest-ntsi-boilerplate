import { identityPermissionCatalog } from './identity';

export interface PermissionDeclaration {
  key: string;
  description?: string;
}

export const permissionRegistry: PermissionDeclaration[] = [
  ...identityPermissionCatalog,
];
