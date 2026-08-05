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
