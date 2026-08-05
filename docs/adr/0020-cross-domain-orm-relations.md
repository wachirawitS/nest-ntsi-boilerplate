# Cross-domain ORM relations

TypeORM relation decorators are allowed only within the same owning domain and are forbidden across owning domains. Cross-domain references store stable identifier columns such as `user_id` or `customer_id` and resolve behavior through the owning module's facade, event-driven projections, or explicit contracts rather than importing another module's entity or binding ORM graphs across module boundaries.
