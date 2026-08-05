import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class SessionExpiredError extends ApplicationError {
  constructor() {
    super({
      code: ErrorCode.SessionExpired,
      message: 'Session has expired',
    });
  }
}
