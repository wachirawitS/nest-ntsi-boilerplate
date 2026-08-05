# Code-declared permission catalog

Permissions are declared in source code by owning modules and synchronized into the Identity permission catalog by the explicit seed command. Admin APIs may read the catalog and assign catalog permissions to roles or users, but they do not create arbitrary permission names, because permissions are a contract between protected code paths and authorization data.
