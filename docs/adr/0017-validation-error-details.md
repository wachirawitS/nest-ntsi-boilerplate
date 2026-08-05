# Validation error details

Validation failures expose `VALIDATION_FAILED` with `details` as an array of `{ field, messages }` items. The API flattens nested validator output into dot-notation field paths and never exposes raw `class-validator` error objects as the public error contract.
