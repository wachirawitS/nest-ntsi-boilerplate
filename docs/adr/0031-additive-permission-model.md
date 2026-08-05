# Additive permission model

Identity authorization uses additive allow permissions only: a user's effective permissions are the union of permissions granted directly to the user and permissions granted by all assigned roles. The baseline intentionally excludes explicit deny semantics so permission checks stay predictable, testable, and small enough for a boilerplate; applications that need policy precedence or conditional denies can introduce a richer policy model later.
