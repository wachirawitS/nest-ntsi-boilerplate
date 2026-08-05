import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class RoleInUseError extends ApplicationError {
  constructor(roleKey: string) {
    super({
      code: ErrorCode.RoleInUse,
      message: 'Role is still assigned to users',
      details: { roleKey },
    });
  }
}
