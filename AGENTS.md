# AI Agent Instructions

This repository is a NestJS boilerplate for business backends that start as a modular monolith and keep modules extractable into services later.

Read this file before making code changes. For deeper context, also read:

- `README.md` for the full project guide
- `CONTEXT.md` for glossary and project language
- `docs/adr/` for architectural decisions

## Non-Negotiable Architecture Rules

- Keep the application a modular monolith with explicit module boundaries.
- Do not import another module's `domain` or `infrastructure` internals.
- Cross-module dependencies must go through the owning module's public API, usually its `index.ts`.
- Entities must stay inside the module that owns them.
- Do not create global `src/entities`, `src/repositories`, `src/services`, or `src/dtos` folders for business concepts.
- Keep `shared` small and non-domain. It may contain technical primitives only.
- Use facades for synchronous cross-module calls that need an immediate answer.
- Use events for cross-module side effects or reactions.
- Do not use events as a shortcut to avoid designing a module facade or return value.

## Module Structure

Every business module should follow this structure:

```txt
src/modules/{module-name}/
  {module-name}.module.ts
  index.ts
  presentation/
  application/
  domain/
  infrastructure/
```

Folder responsibilities:

- `presentation`: controllers, request DTOs, response DTOs, Swagger decorators, HTTP concerns.
- `application`: use cases, application services, public facades, command/query handlers.
- `domain`: entities, value objects, domain errors, domain events, repository interfaces/ports.
- `infrastructure`: TypeORM repository implementations, external API adapters, message broker adapters, cache/storage adapters.

## Public API Rule

Each module decides what other modules may use through `index.ts`.

Allowed:

```ts
import { IdentityFacade } from '../identity';
```

Forbidden:

```ts
import { UserEntity } from '../identity/domain/entities/user.entity';
import { TypeOrmUserRepository } from '../identity/infrastructure/persistence/typeorm-user.repository';
```

If another module needs data or behavior, add a method to the owning module's facade or publish/consume an event. Do not bypass the boundary.

## Domain Event Rules

Use domain events only for facts that already happened.

Good event names:

```txt
identity.user.created
invoice.paid
organization.suspended
```

Bad event names:

```txt
create.user
send.email.now
check.permission
```

Rules:

- Publish events after the state change succeeds.
- Event classes live in the owning module.
- Other modules may import event contracts only through the owning module's public API.
- Event payloads should contain stable identifiers and small facts, not full entities.
- Event handlers must not mutate the publishing module's state directly.
- Event handlers should be idempotent where possible.
- Use events for side effects, notifications, audit logs, projections, and eventual consistency.
- Do not use events when the caller needs an immediate answer or must fail the current operation based on the result.
- Do not put TypeORM entities, repositories, request DTOs, or private domain objects in event payloads.

Example:

```ts
this.events.publish(
  new UserCreatedEvent({
    userId: user.id,
    email: user.email,
  }),
);
```

When adding or changing an event-driven flow, update the README with:

- A Mermaid sequence or flow diagram.
- Owning domain and publishing use case.
- Event name and payload table.
- Consumers and whether consumer failure affects the main API flow.
- Acceptance criteria proving the publisher does not import or call consumers directly.

## Use Case Rules

A use case represents one application action, such as `CreateUserUseCase`, `GetUserUseCase`, or `MarkInvoiceAsPaidUseCase`.

- Keep controllers thin.
- Put business workflow in use cases.
- Use cases should depend on repository ports/facades, not TypeORM repositories directly.
- Map domain/application errors to HTTP exceptions in `presentation`.
- Prefer explicit input interfaces for use cases.

## DTO and Validation Rules

Request DTOs live in `presentation/dtos`.

- Use `class-validator` decorators such as `@IsString()`, `@IsEmail()`, `@IsBoolean()`, `@IsUUID()`, `@MinLength()`, `@MaxLength()`, and `@IsOptional()`.
- Use Swagger decorators such as `@ApiProperty()` and `@ApiPropertyOptional()` on request/response DTOs.
- API request/response fields use `camelCase`.
- Do not expose TypeORM entities directly as controller responses. Map entities to response DTOs.

## Response and Error Rules

All JSON API responses use the standard envelope.

Success:

```json
{
  "success": true,
  "data": {},
  "meta": {
    "requestId": "8efc77b2-7fd6-4fc8-a31f-eecf397a51d2"
  }
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Validation failed",
    "details": []
  },
  "meta": {
    "requestId": "8efc77b2-7fd6-4fc8-a31f-eecf397a51d2",
    "timestamp": "2026-08-05T10:30:00.000Z",
    "path": "/users"
  }
}
```

- Controllers return response DTOs or data objects; do not manually wrap success responses.
- The global response interceptor creates the success envelope.
- The global exception filter creates the error envelope.
- Domain/application errors should extend `ApplicationError`.
- `ApplicationError` carries `code`, `message`, and optional `details`, but not HTTP status.
- Map error codes to HTTP statuses in the global error status map.
- Error codes use stable `SCREAMING_SNAKE_CASE`.
- Clients must branch on `error.code`, not `error.message`.
- Preserve `x-request-id` when callers send it; otherwise generate one.
- Return `x-request-id` in both response headers and response `meta.requestId`.
- Validation details use `{ field, messages }[]`.
- Paginated lists return arrays in `data` and pagination details in `meta.pagination`.

## Database Rules

The persistence stack is Postgres + TypeORM + migrations.

- Do not enable TypeORM `synchronize`.
- Database schemas represent owning domains.
- Tables live under the owning domain schema, for example `identity.users` or `billing.invoices`.
- TypeScript properties and API payloads use `camelCase`.
- Database schemas, tables, columns, indexes, and constraints use `snake_case`.
- Primary key column is `id`.
- Foreign key columns use `{referenced_singular}_id`.
- Timestamp columns use `created_at`, `updated_at`, and optionally `deleted_at`.
- Constraint/index names include the owning domain prefix.

Examples:

```txt
pk_identity_users
uq_identity_users_email
ix_identity_users_created_at
fk_billing_invoice_lines_invoice_id_invoices
chk_billing_invoices_total_amount_non_negative
```

## Migration Rules

Migrations live in `src/migrations`.

- Use central migrations with owning-domain names, for example `create-identity-users`.
- Migrations must create their schema when needed, for example `CREATE SCHEMA IF NOT EXISTS "identity"`.
- Review generated migrations before accepting them.
- Do not change another domain's tables from a migration unless the reason is explicit and justified.

## Naming Rules

- Files: kebab-case, for example `create-user.use-case.ts`.
- Classes: PascalCase, for example `CreateUserUseCase`.
- TypeScript properties: camelCase.
- API JSON fields: camelCase.
- Database objects: snake_case.
- Entity classes end with `Entity`.
- Request DTOs end with `RequestDto`.
- Response DTOs end with `ResponseDto`.
- Repository ports use abstract classes or explicit interfaces in `domain/repositories`.
- TypeORM implementations should be named like `TypeOrmUserRepository`.

## Swagger Rules

- Keep Swagger enabled by default unless `SWAGGER_ENABLED=false`.
- Swagger UI path is `api/docs`.
- OpenAPI JSON path is `api/docs-json`.
- Add Swagger metadata whenever adding or changing public DTOs/controllers.

## Docker Rules

- Keep production images small.
- Use the existing multi-stage Dockerfile pattern.
- Final runner image should contain only `dist`, production `node_modules`, and required package metadata.
- Do not copy source, tests, docs, `.env`, or development dependencies into the final image.

## Verification

Before finishing code changes, run the checks relevant to the change:

```bash
npm run build
npm run lint
npm test -- --runInBand
git diff --check
```

For Docker changes, also run:

```bash
docker build -t nest-ntsi-boilerplate:local .
```

For dependency changes, run:

```bash
npm audit --omit=dev
```

## When Unsure

- Prefer the existing `identity` module as the reference pattern.
- Prefer explicit boundaries over convenience imports.
- Prefer small use cases over large generic services.
- Prefer adding a facade method or event over leaking internal entities/repositories.
- If a decision changes architecture, update `docs/adr/`.
- If a term changes the project language, update `CONTEXT.md`.
