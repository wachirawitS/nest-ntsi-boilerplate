import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { UserEntity } from './user.entity';

@Entity({ schema: 'identity', name: 'user_permissions' })
@Unique('uq_identity_user_permissions_user_id_permission_id', [
  'userId',
  'permissionId',
])
export class UserPermissionEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_identity_user_permissions',
  })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_identity_user_permissions_user_id_users',
  })
  user!: UserEntity;

  @Column({ name: 'permission_id', type: 'uuid' })
  permissionId!: string;

  @ManyToOne(() => PermissionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'permission_id',
    foreignKeyConstraintName:
      'fk_identity_user_permissions_permission_id_permissions',
  })
  permission!: PermissionEntity;
}
