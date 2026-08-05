# Cross-domain read models

Business domain repositories must not hide joins across owning domains. Cross-domain reads use application-layer facade composition for small fresh reads, event-driven projections for frequent list/report use cases, or a dedicated reporting module that owns denormalized read models and does not mutate source domain state.
