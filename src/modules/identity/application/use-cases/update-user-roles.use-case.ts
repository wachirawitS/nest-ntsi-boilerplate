import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { RoleNotFoundError } from '../../domain/errors/role-not-found.error';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRolesChangedEvent } from '../../domain/events/user-roles-changed.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class UpdateUserRolesUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly transaction: IdentityTransaction,
    private readonly events: EventBus,
  ) {}

  async execute(input: {
    userId: string;
    roleKeys: string[];
    changedByUserId: string | null;
  }): Promise<void> {
    const [user, roles] = await Promise.all([
      this.users.findById(input.userId),
      this.access.findRolesByKeys(input.roleKeys),
    ]);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    const missing = input.roleKeys.find(
      (roleKey) => !roles.some((role) => role.key === roleKey),
    );

    if (missing) {
      throw new RoleNotFoundError(missing);
    }

    await this.transaction.run(() =>
      this.access.replaceUserRoles(
        input.userId,
        roles.map((role) => role.id),
      ),
    );

    this.events.publish(
      new UserRolesChangedEvent({
        userId: input.userId,
        roleKeys: input.roleKeys,
        changedByUserId: input.changedByUserId,
      }),
    );
  }
}
