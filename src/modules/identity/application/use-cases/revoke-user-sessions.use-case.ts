import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { SessionRevokedEvent } from '../../domain/events/session-revoked.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class RevokeUserSessionsUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly access: IdentityAccessRepository,
    private readonly events: EventBus,
  ) {}

  async execute(input: { userId: string; reason?: string }): Promise<void> {
    const user = await this.users.findById(input.userId);

    if (!user) {
      throw new UserNotFoundError(input.userId);
    }

    const reason = input.reason ?? 'admin_revoked';
    await this.access.revokeUserSessions(input.userId, reason);
    this.events.publish(
      new SessionRevokedEvent({
        userId: input.userId,
        sessionId: null,
        reason,
      }),
    );
  }
}
