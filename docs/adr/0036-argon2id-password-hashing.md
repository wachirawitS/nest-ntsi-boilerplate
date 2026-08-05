# Argon2id password hashing

Local credentials use Argon2id password hashing behind an Identity-owned password hasher port. This gives the baseline a modern password storage default while keeping hashing library details in infrastructure so future applications can tune or replace the implementation without leaking it into controllers, use cases, or other modules.
