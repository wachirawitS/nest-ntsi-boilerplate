import { Injectable } from '@nestjs/common';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(): Promise<UserEntity[]> {
    return this.users.list();
  }
}
