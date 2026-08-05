import { ApplicationError, ErrorCode } from '../../../../shared/api';

export class PermissionNotFoundError extends ApplicationError {
  constructor(permissionKey: string) {
    super({
      code: ErrorCode.PermissionNotFound,
      message: 'Permission was not found',
      details: { permissionKey },
    });
  }
}
