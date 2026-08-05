import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class UserAlreadyExistsError extends ApplicationError {
  constructor(email: string) {
    super({
      code: ErrorCode.UserAlreadyExists,
      message: 'User with this email already exists',
      details: { email },
    });
  }
}
