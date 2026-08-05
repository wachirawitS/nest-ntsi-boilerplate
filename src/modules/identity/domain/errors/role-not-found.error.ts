import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class RoleNotFoundError extends ApplicationError {
  constructor(roleKey: string) {
    super({
      code: ErrorCode.RoleNotFound,
      message: 'Role was not found',
      details: { roleKey },
    });
  }
}
