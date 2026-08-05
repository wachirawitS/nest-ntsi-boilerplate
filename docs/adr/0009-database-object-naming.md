# Database object naming

Database constraints and indexes include the owning domain and table name in their names, such as `pk_identity_users`, `uq_identity_users_email`, and `ix_billing_invoices_created_at`. The extra prefix is intentionally verbose so ownership stays visible in database tooling and names are less likely to collide as schemas and modules grow.
