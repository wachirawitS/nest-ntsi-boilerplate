import { Injectable } from '@nestjs/common';
import { CacheStore } from '../../../../shared/cache';
import { RateLimitExceededError } from '../../domain/errors/rate-limit-exceeded.error';

@Injectable()
export class AuthRateLimiter {
  constructor(private readonly cache: CacheStore) {}

  async assertAllowed(key: string): Promise<void> {
    const limit = Number(process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS ?? 10);
    const windowMs = Number(process.env.AUTH_RATE_LIMIT_WINDOW_MS ?? 60_000);
    const cacheKey = `identity:auth-rate:${key}`;
    const attempts = (await this.cache.get<number>(cacheKey)) ?? 0;

    if (attempts >= limit) {
      throw new RateLimitExceededError();
    }

    await this.cache.set(cacheKey, attempts + 1, { ttlMs: windowMs });
  }
}
