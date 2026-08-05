# Application error contract

Domain and application failures use an `ApplicationError` contract that carries a stable error code, human-readable message, and optional details without depending on HTTP status codes. The global exception filter owns transport mapping from error codes to HTTP statuses, which keeps business errors reusable outside HTTP and prevents controllers from repeating error mapping logic.
