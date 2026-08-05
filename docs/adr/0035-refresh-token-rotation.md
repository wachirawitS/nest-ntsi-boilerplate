# Refresh token rotation

Refresh tokens are rotated on every successful refresh, and reuse of an old refresh token revokes the session. Identity session records therefore track the current refresh token hash and revocation state so the baseline can detect likely token theft instead of allowing a leaked refresh token to remain valid until expiry.
