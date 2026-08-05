import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../../domain/entities/role.entity';
import { RoleNotFoundError } from '../../domain/errors/role-not-found.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly access: IdentityAccessRepository) {}

  async execute(input: { key: string; name: string }): Promise<RoleEntity> {
    const role = await this.access.findRoleByKey(input.key);

    if (!role) {
      throw new RoleNotFoundError(input.key);
    }

    role.name = input.name;

    return this.access.updateRole(role);
  }
}
