# Opaque refresh token sessions

Identity uses short-lived JWT access tokens and opaque refresh tokens backed by hashed server-side session records. This gives the boilerplate an explicit session lifecycle for login, refresh rotation, logout, and revocation instead of relying on long-lived stateless refresh JWTs that are harder to invalidate after role changes, logout, or token compromise.
