import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';
import { CacheSetOptions, CacheStore } from '../cache-store';

@Injectable()
export class NestCacheStore implements CacheStore {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  async set<T>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): Promise<void> {
    await this.cache.set(key, value, options?.ttlMs);
  }

  async delete(key: string): Promise<void> {
    await this.cache.del(key);
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T> {
    const cachedValue = await this.get<T>(key);

    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const value = await factory();
    await this.set(key, value, options);

    return value;
  }
}
