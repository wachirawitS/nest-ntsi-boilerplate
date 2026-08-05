import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ schema: 'identity', name: 'user_credentials' })
@Unique('uq_identity_user_credentials_user_id', ['userId'])
export class UserCredentialEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_identity_user_credentials',
  })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_identity_user_credentials_user_id_users',
  })
  user!: UserEntity;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ name: 'password_changed_at', type: 'timestamptz', nullable: true })
  passwordChangedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  static create(input: {
    userId: string;
    passwordHash: string;
  }): UserCredentialEntity {
    const credential = new UserCredentialEntity();
    credential.userId = input.userId;
    credential.passwordHash = input.passwordHash;
    credential.passwordChangedAt = null;

    return credential;
  }
}
