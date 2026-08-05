# Identity owns the access control baseline

The local authentication and RBAC baseline will live inside the `identity` module rather than a separate `auth` module. User identity, credentials, sessions, and baseline authorization decisions share one lifecycle in this boilerplate, and splitting them on day one would create cross-domain references before there is a real second owning domain to justify the extra boundary.
