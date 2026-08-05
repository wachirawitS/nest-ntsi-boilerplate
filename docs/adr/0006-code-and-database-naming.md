# Code and database naming

TypeScript code and API payloads use `camelCase`, while Postgres schemas, tables, and columns use `snake_case`. Entities explicitly map code properties to database names so application code stays idiomatic TypeScript without leaking database naming into the API contract.
