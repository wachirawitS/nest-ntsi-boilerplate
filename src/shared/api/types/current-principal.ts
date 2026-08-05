export interface CurrentPrincipal {
  userId: string;
  sessionId: string;
  email: string;
  roleKeys: string[];
  permissions: string[];
}
