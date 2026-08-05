# NTSI Nest Boilerplate

NestJS boilerplate for business backends that start as a modular monolith and keep a clear path to extract modules into services later.

## Stack

- NestJS
- TypeScript
- Postgres
- TypeORM
- Jest
- ESLint + Prettier

## Architecture

Modules live under `src/modules/{module-name}` and use responsibility-oriented folders:

```txt
src/modules/identity/
  identity.module.ts
  index.ts
  presentation/
  application/
  domain/
  infrastructure/
```

Rules:

- Other modules import only from a module's public API, usually `index.ts`.
- Do not import another module's `domain` or `infrastructure` internals.
- Entities stay inside their owning module.
- `shared` is only for small non-domain technical primitives.
- Cross-module synchronous calls go through exported application facades.
- Cross-module side effects should use events.

## Database

Postgres objects live under the schema of the owning domain:

```txt
identity.users
billing.invoices
```

Naming:

- TypeScript/API fields use `camelCase`.
- Database schemas, tables, and columns use `snake_case`.
- Constraints and indexes include the owning domain, for example `pk_identity_users` and `uq_identity_users_email`.
- Schema changes use migrations only; do not use TypeORM `synchronize`.

## Local Development

```bash
npm install
cp .env.example .env
docker compose up -d postgres
npm run migration:run
npm run start:dev
```

## Commands

```bash
npm run build
npm run lint
npm test
npm run migration:run
npm run migration:revert
npm run migration:run:prod
```

## Docker

```bash
docker build -t nest-ntsi-boilerplate .
docker run --rm -p 3000:3000 --env-file .env nest-ntsi-boilerplate
```

Architectural decisions are recorded in `docs/adr`.
