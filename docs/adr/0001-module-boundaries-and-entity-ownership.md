# Module boundaries and entity ownership

This boilerplate treats each module as the owner of its domain and persistence model. Code must not import another module's domain internals, and entities stay inside the module that owns them instead of being collected in a shared entity directory; this preserves a realistic extraction path from modular monolith to independently deployed service.

Cross-module dependencies must go through the owning module's public API, and boundary rules should be enforced with linting/path conventions rather than team discipline alone.
