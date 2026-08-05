import { DomainEvent } from '../../../../shared/events';

export interface SessionRevokedPayload {
  userId: string;
  sessionId: string | null;
  reason: string;
}

export class SessionRevokedEvent implements DomainEvent<SessionRevokedPayload> {
  static readonly eventName = 'identity.session.revoked';

  readonly name = SessionRevokedEvent.eventName;
  readonly occurredAt = new Date();

  constructor(readonly payload: SessionRevokedPayload) {}
}
