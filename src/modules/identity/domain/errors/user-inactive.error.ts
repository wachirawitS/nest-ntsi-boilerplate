import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class UserInactiveError extends ApplicationError {
  constructor(userId: string) {
    super({
      code: ErrorCode.UserInactive,
      message: 'User is inactive',
      details: { userId },
    });
  }
}
