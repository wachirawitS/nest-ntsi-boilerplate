# Cross-domain reference snapshots

A domain may store snapshot values from another owning domain when those values become part of its own historical or business record, such as customer name or tax ID on an invoice. Snapshot columns must be named explicitly, are not the source of truth for the referenced domain, and should not be used when the business requirement is to show the latest owner data.
