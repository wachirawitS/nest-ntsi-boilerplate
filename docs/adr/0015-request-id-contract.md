# Request ID contract

The API uses `x-request-id` as the request correlation header. If a caller provides it, the server preserves it; otherwise the server generates a request ID, returns it in the `x-request-id` response header, and includes it in both success and error response metadata for log and client correlation.
