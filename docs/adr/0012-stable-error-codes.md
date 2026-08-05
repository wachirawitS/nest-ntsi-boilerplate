# Stable error codes

API errors expose stable `SCREAMING_SNAKE_CASE` error codes that are independent from HTTP status codes. Clients use these codes for branching and localization, while human-readable messages may change; domain-specific codes use the owning resource or domain name, such as `USER_NOT_FOUND` or `INVOICE_ALREADY_PAID`.
