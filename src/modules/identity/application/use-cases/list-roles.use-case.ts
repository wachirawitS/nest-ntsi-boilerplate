import { Injectable } from '@nestjs/common';
import { RoleEntity } from '../../domain/entities/role.entity';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly access: IdentityAccessRepository) {}

  async execute(): Promise<RoleEntity[]> {
    return this.access.listRoles();
  }
}
