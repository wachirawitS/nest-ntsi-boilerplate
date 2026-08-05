import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class RateLimitExceededError extends ApplicationError {
  constructor() {
    super({
      code: ErrorCode.RateLimitExceeded,
      message: 'Too many attempts',
    });
  }
}
