import { Injectable } from '@nestjs/common';
import { UserEntity } from '../domain/entities/user.entity';
import { GetUserUseCase } from './use-cases/get-user.use-case';

@Injectable()
export class IdentityFacade {
  constructor(private readonly getUser: GetUserUseCase) {}

  async getUserProfile(userId: string): Promise<UserEntity> {
    return this.getUser.execute(userId);
  }

  async assertUserExists(userId: string): Promise<void> {
    await this.getUser.execute(userId);
  }
}
