export interface CacheSetOptions {
  ttlMs?: number;
}

export abstract class CacheStore {
  abstract get<T>(key: string): Promise<T | undefined>;
  abstract set<T>(
    key: string,
    value: T,
    options?: CacheSetOptions,
  ): Promise<void>;
  abstract delete(key: string): Promise<void>;
  abstract getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheSetOptions,
  ): Promise<T>;
}
