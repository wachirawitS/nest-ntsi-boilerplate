# Standard API response envelope

JSON API endpoints use a standard response envelope with `success`, `data`, and optional `meta` instead of returning raw payloads directly. This makes client handling, pagination metadata, request tracing, and documentation predictable, with explicit exceptions for non-JSON responses such as file downloads, streams, redirects, health checks, or no-content endpoints.
