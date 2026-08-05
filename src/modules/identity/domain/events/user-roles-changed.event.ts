import { DomainEvent } from '../../../../shared/events';

export interface UserRolesChangedPayload {
  userId: string;
  roleKeys: string[];
  changedByUserId: string | null;
}

export class UserRolesChangedEvent implements DomainEvent<UserRolesChangedPayload> {
  static readonly eventName = 'identity.user.roles.changed';

  readonly name = UserRolesChangedEvent.eventName;
  readonly occurredAt = new Date();

  constructor(readonly payload: UserRolesChangedPayload) {}
}
