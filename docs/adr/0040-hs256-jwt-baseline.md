# HS256 JWT baseline

The local authentication baseline signs short-lived access tokens with HS256 using a required environment secret validated by configuration. JWT signing and verification remain behind an Identity-owned token issuer/verifier port so applications can later move to RS256, JWKS, or an external identity provider without exposing token library details to controllers, guards, or business modules.
