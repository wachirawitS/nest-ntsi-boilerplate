# Central migrations with domain prefixes

TypeORM migrations live in a central `src/migrations` directory and include the owning domain in the migration name. This keeps the migration runner simple and preserves global ordering, while schema names and migration names still make ownership visible enough to extract a domain's migrations later.
