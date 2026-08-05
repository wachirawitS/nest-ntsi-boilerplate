import { Injectable } from '@nestjs/common';
import { ApplicationError, ErrorCode } from '../../../../shared/api';
import { EventBus } from '../../../../shared/events';
import { PermissionNotFoundError } from '../../domain/errors/permission-not-found.error';
import { RoleNotFoundError } from '../../domain/errors/role-not-found.error';
import { RolePermissionsChangedEvent } from '../../domain/events/role-permissions-changed.event';
import { IdentityAccessRepository } from '../../domain/repositories/identity-access.repository';
import { IdentityTransaction } from '../../domain/repositories/identity-transaction';

@Injectable()
export class UpdateRolePermissionsUseCase {
  constructor(
    private readonly access: IdentityAccessRepository,
    private readonly transaction: IdentityTransaction,
    private readonly events: EventBus,
  ) {}

  async execute(input: {
    roleKey: string;
    permissionKeys: string[];
    changedByUserId: string | null;
  }): Promise<void> {
    const [role, permissions] = await Promise.all([
      this.access.findRoleByKey(input.roleKey),
      this.access.findPermissionsByKeys(input.permissionKeys),
    ]);

    if (!role) {
      throw new RoleNotFoundError(input.roleKey);
    }

    if (role.isSystem) {
      throw new ApplicationError({
        code: ErrorCode.Forbidden,
        message: 'System role grants are managed by the identity seed command',
        details: { roleKey: input.roleKey },
      });
    }

    const missing = input.permissionKeys.find(
      (permissionKey) =>
        !permissions.some((permission) => permission.key === permissionKey),
    );

    if (missing) {
      throw new PermissionNotFoundError(missing);
    }

    await this.transaction.run(() =>
      this.access.replaceRolePermissions(
        role.id,
        permissions.map((permission) => permission.id),
      ),
    );

    this.events.publish(
      new RolePermissionsChangedEvent({
        roleKey: role.key,
        permissionKeys: input.permissionKeys,
        changedByUserId: input.changedByUserId,
      }),
    );
  }
}
