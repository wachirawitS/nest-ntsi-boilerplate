import { Injectable } from '@nestjs/common';
import { ApplicationError, ErrorCode } from '../../../../shared/api';
import { RoleInUseError } from '../../domain/errors/role-in-use.error';
import { RoleNotFoundError } from '../../domain/errors/role-not-found.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class DeleteRoleUseCase {
  constructor(private readonly access: IdentityAccessRepository) {}

  async execute(roleKey: string): Promise<void> {
    const role = await this.access.findRoleByKey(roleKey);

    if (!role) {
      throw new RoleNotFoundError(roleKey);
    }

    if (role.isSystem) {
      throw new ApplicationError({
        code: ErrorCode.Forbidden,
        message: 'System roles cannot be deleted',
        details: { roleKey },
      });
    }

    if ((await this.access.countUsersWithRole(role.id)) > 0) {
      throw new RoleInUseError(roleKey);
    }

    await this.access.deleteRole(role.id);
  }
}
