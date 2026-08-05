import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../../../shared/cache';
import { IdentityCacheKeys } from '../cache/identity-cache-keys';
import { UserEntity } from '../../domain/entities/user.entity';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { UserRepository } from '../../domain/repositories/user.repository';

@Injectable()
export class GetUserUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly cache: CacheStore,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const cachedUser = await this.cache.getOrSet(
      IdentityCacheKeys.userById(userId),
      async () => {
        const foundUser = await this.users.findById(userId);

        if (!foundUser) {
          throw new UserNotFoundError(userId);
        }

        return this.toCacheRecord(foundUser);
      },
      { ttlMs: 60_000 },
    );

    return this.fromCacheRecord(cachedUser);
  }

  toCacheRecord(user: UserEntity): UserCacheRecord {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  fromCacheRecord(record: UserCacheRecord): UserEntity {
    const user = new UserEntity();
    user.id = record.id;
    user.email = record.email;
    user.firstName = record.firstName;
    user.lastName = record.lastName;
    user.isActive = record.isActive;
    user.createdAt = new Date(record.createdAt);
    user.updatedAt = new Date(record.updatedAt);

    return user;
  }
}

interface UserCacheRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
