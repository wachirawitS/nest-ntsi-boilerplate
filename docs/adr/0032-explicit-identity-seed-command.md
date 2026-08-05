# Explicit identity seed command

Identity permissions, baseline roles, role grants, and optional bootstrap admin setup will be provisioned through an explicit idempotent seed command rather than application bootstrap writes. This keeps runtime startup free of provisioning side effects and makes permission synchronization a deliberate deployment step that can be logged, retried, and controlled in CI/CD.
