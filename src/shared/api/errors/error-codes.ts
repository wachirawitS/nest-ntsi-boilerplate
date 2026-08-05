export const ErrorCode = {
  ValidationFailed: 'VALIDATION_FAILED',
  BadRequest: 'BAD_REQUEST',
  Unauthenticated: 'UNAUTHENTICATED',
  Forbidden: 'FORBIDDEN',
  ResourceNotFound: 'RESOURCE_NOT_FOUND',
  InternalServerError: 'INTERNAL_SERVER_ERROR',
  UserAlreadyExists: 'USER_ALREADY_EXISTS',
  UserNotFound: 'USER_NOT_FOUND',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
