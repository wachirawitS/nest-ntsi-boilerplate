import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity({ schema: 'identity', name: 'sessions' })
@Index('ix_identity_sessions_user_id', ['userId'])
@Index('ix_identity_sessions_expires_at', ['expiresAt'])
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_identity_sessions',
  })
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'fk_identity_sessions_user_id_users',
  })
  user!: UserEntity;

  @Column({ name: 'refresh_token_secret_hash', type: 'text' })
  refreshTokenSecretHash!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'last_used_at', type: 'timestamptz', nullable: true })
  lastUsedAt!: Date | null;

  @Column({ name: 'revoked_at', type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;

  @Column({
    name: 'revoked_reason',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  revokedReason!: string | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 64, nullable: true })
  ipAddress!: string | null;

  @Column({ name: 'user_agent', type: 'varchar', length: 512, nullable: true })
  userAgent!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  static create(input: {
    userId: string;
    refreshTokenSecretHash: string;
    expiresAt: Date;
    ipAddress?: string | null;
    userAgent?: string | null;
  }): SessionEntity {
    const session = new SessionEntity();
    session.userId = input.userId;
    session.refreshTokenSecretHash = input.refreshTokenSecretHash;
    session.expiresAt = input.expiresAt;
    session.lastUsedAt = null;
    session.revokedAt = null;
    session.revokedReason = null;
    session.ipAddress = input.ipAddress ?? null;
    session.userAgent = input.userAgent ?? null;

    return session;
  }

  get isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  get isExpired(): boolean {
    return this.expiresAt.getTime() <= Date.now();
  }
}
