# Standard API error envelope

JSON API errors use a standard envelope with `success: false`, an `error` object, and response metadata. Clients must depend on stable `error.code` values instead of parsing human-readable messages, while HTTP status codes continue to represent transport-level semantics and production responses must not expose stack traces.
