# Module internal structure

Modules use responsibility-oriented folders: `presentation`, `application`, `domain`, and `infrastructure`. We choose this over Nest-style `controllers`, `services`, `dtos`, and `entities` as top-level module folders because the boilerplate optimizes for clear ownership, testable business workflows, and future service extraction rather than only fast CRUD scaffolding.
