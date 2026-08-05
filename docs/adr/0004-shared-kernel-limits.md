# Shared kernel limits

The boilerplate allows a small `shared` area for technical primitives such as decorators, filters, guards, interceptors, pipes, utility types, and generic errors. Business entities, repositories, services, and DTOs must stay inside their owning module; when a concept has a business owner, other modules depend on that owner through a public facade, event, or explicit contract instead of moving the concept into `shared`.
