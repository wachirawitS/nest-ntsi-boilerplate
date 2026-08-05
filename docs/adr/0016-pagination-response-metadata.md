# Pagination response metadata

Paginated list endpoints return arrays in `data` and page-oriented pagination details under `meta.pagination`. The public API uses `page` and `perPage` rather than `offset` and `limit`, while repositories may still use offset-based queries internally; `total` should be provided by default and omitted only for explicitly performance-sensitive endpoints.
