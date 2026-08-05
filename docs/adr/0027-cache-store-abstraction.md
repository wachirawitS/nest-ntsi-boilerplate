# Cache store abstraction

The boilerplate uses a shared `CacheStore` abstraction backed initially by Nest's local in-memory cache. Business modules depend on `CacheStore` and own their cache keys, so the backing implementation can later change to Redis without changing use cases; cached values are treated as performance hints, not a source of truth.
