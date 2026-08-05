import { Injectable } from '@nestjs/common';
import { EventBus } from '../../../../shared/events';
import { SessionRevokedEvent } from '../../domain/events/session-revoked.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';

@Injectable()
export class LogoutUseCase {
  constructor(
    private readonly access: IdentityAccessRepository,
    private readonly events: EventBus,
  ) {}

  async execute(input: { userId: string; sessionId: string }): Promise<void> {
    await this.access.revokeSession(input.sessionId, 'logout');
    this.events.publish(
      new SessionRevokedEvent({
        userId: input.userId,
        sessionId: input.sessionId,
        reason: 'logout',
      }),
    );
  }
}
