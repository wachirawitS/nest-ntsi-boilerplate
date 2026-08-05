import { Injectable } from '@nestjs/common';
import { PrincipalDto, toPrincipalDto } from '../dtos/principal.dto';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';

@Injectable()
export class GetCurrentPrincipalUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
  ) {}

  async execute(userId: string): Promise<PrincipalDto> {
    const [user, access] = await Promise.all([
      this.users.findById(userId),
      this.access.getPrincipalAccess(userId),
    ]);

    if (!user) {
      throw new UserNotFoundError(userId);
    }

    return toPrincipalDto({
      user,
      roleKeys: access.roleKeys,
      permissionKeys: access.permissionKeys,
    });
  }
}
