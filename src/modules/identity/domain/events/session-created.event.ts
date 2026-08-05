import { DomainEvent } from '../../../../shared/events';

export interface SessionCreatedPayload {
  userId: string;
  sessionId: string;
}

export class SessionCreatedEvent implements DomainEvent<SessionCreatedPayload> {
  static readonly eventName = 'identity.session.created';

  readonly name = SessionCreatedEvent.eventName;
  readonly occurredAt = new Date();

  constructor(readonly payload: SessionCreatedPayload) {}
}
