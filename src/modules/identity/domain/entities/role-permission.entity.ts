import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { RoleEntity } from './role.entity';

@Entity({ schema: 'identity', name: 'role_permissions' })
@Unique('uq_identity_role_permissions_role_id_permission_id', [
  'roleId',
  'permissionId',
])
export class RolePermissionEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_identity_role_permissions',
  })
  id!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => RoleEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'role_id',
    foreignKeyConstraintName: 'fk_identity_role_permissions_role_id_roles',
  })
  role!: RoleEntity;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId!: string;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName:
      'fk_identity_role_permissions_permission_id_permissions',
  })
  permission!: PermissionEntity;
}
