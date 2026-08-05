export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  BadRequest: 'BAD_REQUEST',
  Unauthenticated: 'UNAUTHENTICATED',
  Forbidden: 'FORBIDDEN',
  ResourceNotFound: 'RESOURCE_NOT_FOUND',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  UserAlreadyExists: 'USER_ALREADY_EXISTS',
  UserNotFound: 'USER_NOT_FOUND',
  InvalidCredentials: 'INVALID_CREDENTIALS',
  SessionExpired: 'SESSION_EXPIRED',
  SessionRevoked: 'SESSION_REVOKED',
  InsufficientPermissions: 'INSUFFICIENT_PERMISSIONS',
  RoleNotFound: 'ROLE_NOT_FOUND',
  RoleInUse: 'ROLE_IN_USE',
  PermissionNotFound: 'PERMISSION_NOT_FOUND',
  UserInactive: 'USER_INACTIVE',
  RateLimitExceeded: 'RATE_LIMIT_EXCEEDED',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
