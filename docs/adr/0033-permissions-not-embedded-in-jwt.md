# Permissions are not embedded in JWTs

Access tokens carry identity and session claims but not effective permission lists. Guards resolve current permissions through Identity, with short-lived caching where useful, so role and permission changes can take effect without waiting for issued access tokens to expire and without turning tokens into large authorization snapshots.
