import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ schema: 'identity', name: 'users' })
@Index('uq_identity_users_email', ['email'], { unique: true })
@Index('ix_identity_users_created_at', ['createdAt'])
export class UserEntity {
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'pk_identity_users',
  })
  id!: string;

  @Column({ name: 'email', type: 'varchar', length: 320 })
  email!: string;

  @Column({ name: 'first_name', type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  static create(input: {
    email: string;
    firstName: string;
    lastName: string;
  }): UserEntity {
    const user = new UserEntity();
    user.email = input.email.toLowerCase();
    user.firstName = input.firstName;
    user.lastName = input.lastName;
    user.isActive = true;

    return user;
  }
}
