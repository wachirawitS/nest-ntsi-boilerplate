import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../../../shared/cache';
import { EventBus } from '../../../../shared/events';
import { IdentityCacheKeys } from '../cache/identity-cache-keys';
import { SessionRevokedEvent } from '../../domain/events/session-revoked.event';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class SetUserActiveStatusUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly transaction: IdentityTransaction,
    private readonly cache: CacheStore,
    private readonly events: EventBus,
  ) {}

  async execute(input: { userId: string; isActive: boolean }): Promise<void> {
    const user = await this.users.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    await this.transaction.run(async () => {
      user.isActive = input.isActive;
      await this.users.update(user);

      if (!input.isActive) {
        await this.access.revokeUserSessions(input.userId, 'user_deactivated');
      }
    });
    await this.cache.delete(IdentityCacheKeys.userById(input.userId));

    if (!input.isActive) {
      this.events.publish(
        new SessionRevokedEvent({
          userId: input.userId,
          sessionId: null,
          reason: 'user_deactivated',
        }),
      );
    }
  }
}
