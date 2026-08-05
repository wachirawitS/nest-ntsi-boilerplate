# Cross-module communication

Modules communicate through a hybrid of public application facades and domain events. A module may call another module's exported facade when it needs an immediate answer, while side effects and cross-module reactions should use events; direct imports from another module's domain, persistence, or infrastructure remain forbidden.
