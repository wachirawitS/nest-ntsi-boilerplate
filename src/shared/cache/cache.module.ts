import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { CacheStore } from './cache-store';
import { NestCacheStore } from './stores/nest-cache.store';

@Module({
  imports: [
    NestCacheModule.register({
      ttl: Number(process.env.CACHE_TTL_MS ?? 60_000),
    }),
  ],
  providers: [
    {
      provide: CacheStore,
      useClass: NestCacheStore,
    },
  ],
  exports: [CacheStore],
})
export class AppCacheModule {}
