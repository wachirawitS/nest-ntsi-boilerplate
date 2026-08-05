import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class UserNotFoundError extends ApplicationError {
  constructor(userId: string) {
    super({
      code: ErrorCode.UserNotFound,
      message: 'User was not found',
      details: { userId },
    });
  }
}
