# Postgres, TypeORM, and migrations

The boilerplate uses Postgres with TypeORM and migration-based schema changes. `synchronize` must not be used for managed environments; entities stay inside their owning modules, and repository implementations are wired through module infrastructure so persistence details do not become cross-module dependencies.
