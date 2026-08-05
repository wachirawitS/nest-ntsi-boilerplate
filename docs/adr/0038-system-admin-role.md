# System admin role

Identity seeds an `admin` system role whose key cannot be changed, whose record cannot be deleted, and whose grants are owned by the identity seed command. The seed command synchronizes this role to all declared permissions so the boilerplate keeps a reliable break-glass administrative role while custom roles remain editable through admin APIs.
