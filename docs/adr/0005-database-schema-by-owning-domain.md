# Database schema by owning domain

Database tables live under the schema of their owning domain rather than a single shared `public` schema. This makes data ownership visible in Postgres, keeps migrations aligned with module boundaries, and preserves a clearer extraction path if an owning domain later becomes an independently deployed service.
