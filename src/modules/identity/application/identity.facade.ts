import { Injectable } from '@nestjs/common';
import { CurrentPrincipalContext } from '../../../shared/api';
import { UserEntity } from '../domain/entities/user.entity';
import { InsufficientPermissionsError } from '../domain/errors/insufficient-permissions.error';
import { GetUserUseCase } from './use-cases/get-user.use-case';
import { ResolveCurrentPrincipalUseCase } from './use-cases/resolve-current-principal.use-case';

@Injectable()
export class IdentityFacade {
  constructor(
    private readonly getUser: GetUserUseCase,
    private readonly resolveCurrentPrincipal: ResolveCurrentPrincipalUseCase,
  ) {}

  async getUserProfile(userId: string): Promise<UserEntity> {
    return this.getUser.execute(userId);
  }

  async assertUserExists(userId: string): Promise<void> {
    await this.getUser.execute(userId);
  }

  async resolvePrincipal(input: {
    userId: string;
    sessionId: string;
  }): Promise<CurrentPrincipalContext> {
    return this.resolveCurrentPrincipal.execute(input);
  }

  assertHasPermissions(
    principal: CurrentPrincipalContext,
    permissionKeys: string[],
  ): void {
    const permissionSet = new Set(principal.permissions);
    const missingPermissions = permissionKeys.filter(
      (permissionKey) => !permissionSet.has(permissionKey),
    );

    if (missingPermissions.length > 0) {
      throw new InsufficientPermissionsError(missingPermissions);
    }
  }
}
