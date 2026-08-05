# Identity security events

Identity publishes domain events for security-relevant facts that follow successful state changes, such as session creation or revocation and role or permission grant changes. Failed login attempts are logged rather than published as domain events in the baseline because they do not change domain state yet and can become noisy or sensitive without a fuller lockout and security-audit model.
