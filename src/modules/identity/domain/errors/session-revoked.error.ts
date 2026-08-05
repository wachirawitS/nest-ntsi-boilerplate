import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class SessionRevokedError extends ApplicationError {
  constructor() {
    super({
      code: ErrorCode.SessionRevoked,
      message: 'Session has been revoked',
    });
  }
}
