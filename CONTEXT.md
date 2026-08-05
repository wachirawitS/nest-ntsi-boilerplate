# NTSI Nest Boilerplate

Reusable backend application foundation for business systems that start as a modular monolith and preserve clear extraction paths for future services.

## Language

**Modular Monolith**:
A single deployable backend application whose business capabilities are separated into explicit modules with private internals and controlled integration points.
_Avoid_: Layered monolith, folder-only modularity

**Extractable Module**:
A module designed so its domain, persistence, and external contracts can later move into an independently deployed service with minimal caller impact.
_Avoid_: Microservice-ready folder, shared feature module

**Module Public API**:
The explicit exports another module may depend on, usually a Nest module, application-facing service or facade, and stable contracts. Anything not exported through this surface is private to the owning module.
_Avoid_: Barrel for everything, direct internal imports

**Owning Domain**:
The business area responsible for a concept, including its rules, data lifecycle, and persistence schema. A database table is considered to live under the owning domain that controls its meaning and changes.
_Avoid_: Shared schema, common entity owner

**Reference Module**:
A small real module included to demonstrate the boilerplate's structure, boundaries, persistence, and public API conventions. It should prove the pattern without growing into a full product feature set.
_Avoid_: Demo folder, complete auth system

**Response Envelope**:
A consistent JSON wrapper for API responses that separates the operation result from response metadata. Successful JSON responses carry `success`, `data`, and optional `meta`.
_Avoid_: Raw response, ad hoc response shape

**Error Envelope**:
A consistent JSON wrapper for failed API responses that exposes a stable machine-readable error code, a human-readable message, optional details, and response metadata.
_Avoid_: Raw Nest exception response, message-as-contract

**Error Code**:
A stable machine-readable identifier for a failure condition. Error codes use `SCREAMING_SNAKE_CASE`, do not include dynamic values, and are the client-facing contract for error handling.
_Avoid_: Parsed message, dynamic code, status-derived code

**Request ID**:
A correlation identifier for one HTTP request. The API accepts `x-request-id` from callers when present, otherwise generates one, and returns the same value in response metadata and headers.
_Avoid_: Trace text, generated-only id

**Pagination Metadata**:
Response metadata that describes a paginated list using page-oriented fields such as `page`, `perPage`, `total`, `totalPages`, `hasNextPage`, and `hasPreviousPage`.
_Avoid_: Offset metadata as public API, list wrapper object

**Validation Detail**:
A public validation failure item containing a field path and one or more messages. Validation details flatten validator internals into a stable client-facing structure.
_Avoid_: Raw validator error, nested validator object

**Domain Event**:
A fact published after a meaningful state change inside an owning domain. Other modules may react to the event through the owning module's public event contract without importing the owner's internal domain or persistence code.
_Avoid_: Command event, callback, cross-module service shortcut
