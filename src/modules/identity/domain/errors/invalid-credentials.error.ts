import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class InvalidCredentialsError extends ApplicationError {
  constructor() {
    super({
      code: ErrorCode.InvalidCredentials,
      message: 'Invalid email or password',
    });
  }
}
