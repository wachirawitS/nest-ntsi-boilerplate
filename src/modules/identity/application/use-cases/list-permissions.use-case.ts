import { Injectable } from '@nestjs/common';
import { PermissionEntity } from '../../domain/entities/permission.entity';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class ListPermissionsUseCase {
  constructor(private readonly access: IdentityAccessRepository) {}

  async execute(): Promise<PermissionEntity[]> {
    return this.access.listPermissions();
  }
}
