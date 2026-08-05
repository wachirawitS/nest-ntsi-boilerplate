# Local JWT authentication baseline

The access control baseline will issue its own JWT access tokens and refresh tokens from email/password credentials instead of requiring an external identity provider before protected APIs can be used. External providers may be added later behind module-owned contracts, but the boilerplate must remain runnable and demonstrable with local credentials while keeping JWT library details out of business modules.
