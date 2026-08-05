import { Injectable } from '@nestjs/common';
import { ApplicationError, ErrorCode } from '../../../../shared/api';
import { RoleEntity } from '../../domain/entities/role.entity';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly access: IdentityAccessRepository) {}

  async execute(input: { key: string; name: string }): Promise<RoleEntity> {
    const existingRole = await this.access.findRoleByKey(input.key);

    if (existingRole) {
      throw new ApplicationError({
        code: ErrorCode.BadRequest,
        message: 'Role key is already used',
        details: { roleKey: input.key },
      });
    }

    return this.access.createRole({
      key: input.key,
      name: input.name,
      isSystem: false,
    });
  }
}
