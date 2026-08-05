import { HttpStatus } from '@nestjs/common';
import { ErrorCode } from './error-codes';

const errorStatusByCode = new Map<string, HttpStatus>([
  [ErrorCode.ValidationFailed, HttpStatus.BAD_REQUEST],
  [ErrorCode.BadRequest, HttpStatus.BAD_REQUEST],
  [ErrorCode.Unauthenticated, HttpStatus.UNAUTHORIZED],
  [ErrorCode.Forbidden, HttpStatus.FORBIDDEN],
  [ErrorCode.ResourceNotFound, HttpStatus.NOT_FOUND],
  [ErrorCode.UserAlreadyExists, HttpStatus.CONFLICT],
  [ErrorCode.UserNotFound, HttpStatus.NOT_FOUND],
  [ErrorCode.InvalidCredentials, HttpStatus.UNAUTHORIZED],
  [ErrorCode.SessionExpired, HttpStatus.UNAUTHORIZED],
  [ErrorCode.SessionRevoked, HttpStatus.UNAUTHORIZED],
  [ErrorCode.InsufficientPermissions, HttpStatus.FORBIDDEN],
  [ErrorCode.RoleNotFound, HttpStatus.NOT_FOUND],
  [ErrorCode.RoleInUse, HttpStatus.CONFLICT],
  [ErrorCode.PermissionNotFound, HttpStatus.NOT_FOUND],
  [ErrorCode.UserInactive, HttpStatus.FORBIDDEN],
  [ErrorCode.RateLimitExceeded, HttpStatus.TOO_MANY_REQUESTS],
]);

export function getHttpStatusForErrorCode(code: string): HttpStatus {
  return errorStatusByCode.get(code) ?? HttpStatus.INTERNAL_SERVER_ERROR;
}
