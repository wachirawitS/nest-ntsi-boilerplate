# No cross-domain foreign keys by default

Database foreign keys across owning domains are forbidden by default, even when the referencing domain stores another domain's identifier. Cross-domain foreign keys couple schema lifecycle, migration ordering, delete policies, and service extraction; exceptions require an explicit architectural reason such as immutable shared reference data or a domain that is intentionally not extractable.
