import { DomainEvent } from '../../../../shared/events';

export interface RolePermissionsChangedPayload {
  roleKey: string;
  permissionKeys: string[];
  changedByUserId: string | null;
}

export class RolePermissionsChangedEvent implements DomainEvent<RolePermissionsChangedPayload> {
  static readonly eventName = 'identity.role.permissions.changed';

  readonly name = RolePermissionsChangedEvent.eventName;
  readonly occurredAt = new Date();

  constructor(readonly payload: RolePermissionsChangedPayload) {}
}
