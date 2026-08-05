import { Injectable } from '@nestjs/common';
import { PermissionNotFoundError } from '../../domain/errors/permission-not-found.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateUserDirectPermissionsUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly transaction: IdentityTransaction,
  ) {}

  async execute(input: {
    userId: string;
    permissionKeys: string[];
  }): Promise<void> {
    const [user, permissions] = await Promise.all([
      this.users.findById(input.userId),
      this.access.findPermissionsByKeys(input.permissionKeys),
    ]);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    const missing = input.permissionKeys.find(
      (permissionKey) =>
        !permissions.some((permission) => permission.key === permissionKey),
    );

    if (missing) {
      throw new PermissionNotFoundError(missing);
    }

    await this.transaction.run(() =>
      this.access.replaceUserDirectPermissions(
        input.userId,
        permissions.map((permission) => permission.id),
      ),
    );
  }
}
