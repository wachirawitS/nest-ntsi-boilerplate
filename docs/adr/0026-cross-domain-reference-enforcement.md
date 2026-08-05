# Cross-domain reference enforcement

Cross-domain reference rules are enforced first through documentation, AI agent instructions, examples, and review checklists rather than a custom static analysis rule. A custom lint or scan rule should be added later if violations appear repeatedly, especially imports of another domain's entities, cross-domain TypeORM relation decorators, cross-schema foreign keys, or repository joins hidden inside business domains.
