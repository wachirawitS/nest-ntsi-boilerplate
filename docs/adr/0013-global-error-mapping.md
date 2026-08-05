# Global error mapping

Domain and application code may throw typed errors, and a global exception filter maps them into HTTP status codes and the standard error envelope. Controllers should not repeat try/catch mapping logic for known domain errors; this keeps endpoint code focused on input, use case execution, and response DTOs while preserving one consistent client-facing error contract.
