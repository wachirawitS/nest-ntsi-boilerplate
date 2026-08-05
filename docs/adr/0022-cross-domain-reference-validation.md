# Cross-domain reference validation

When a command stores another domain's identifier, it validates required existence or permission through the owning domain's public facade instead of querying that domain's table or repository. Read models that need copied display data should use event-driven projections or explicit query contracts, not repository-level joins across owning domains.
