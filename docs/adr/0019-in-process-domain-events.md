# In-process domain events

The modular monolith uses in-process domain events for cross-module side effects that do not require an immediate answer. Events are published after successful state changes, consumed through public event contracts exported by the owning module, and must not be used to bypass module boundaries or replace synchronous facade calls when the caller needs a result.
