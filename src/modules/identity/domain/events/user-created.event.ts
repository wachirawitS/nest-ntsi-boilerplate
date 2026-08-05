import { DomainEvent } from '../../../../shared/events';

export interface UserCreatedPayload {
  userId: string;
  email: string;
}

export class UserCreatedEvent implements DomainEvent<UserCreatedPayload> {
  static readonly eventName = 'identity.user.created';

  readonly name = UserCreatedEvent.eventName;
  readonly occurredAt = new Date();

  constructor(readonly payload: UserCreatedPayload) {}
}
