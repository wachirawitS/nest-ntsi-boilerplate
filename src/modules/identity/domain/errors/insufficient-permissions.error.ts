import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class InsufficientPermissionsError extends ApplicationError {
  constructor(permissionKeys: string[]) {
    super({
      code: ErrorCode.InsufficientPermissions,
      message: 'Insufficient permissions',
      details: { permissionKeys },
    });
  }
}
