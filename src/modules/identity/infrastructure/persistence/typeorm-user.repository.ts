import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { TypeOrmIdentityTransactionContext } from './typeorm-identity-transaction';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    private readonly transactionContext: TypeOrmIdentityTransactionContext,
  ) {}

  private get repository(): Repository<UserEntity> {
    return (
      this.transactionContext.manager?.getRepository(UserEntity) ?? this.users
    );
  }

  async save(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }

  async findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { email } });
  }

  async list(): Promise<UserEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async update(user: UserEntity): Promise<UserEntity> {
    return this.repository.save(user);
  }
}
