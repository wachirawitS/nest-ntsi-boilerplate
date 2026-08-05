# Cross-domain reference naming

Cross-domain identifier columns use `{referenced_concept}_id`, and copied historical values use `{referenced_concept}_{field}_snapshot`. TypeScript properties use camelCase equivalents such as `customerId` and `customerNameSnapshot`, while database columns use snake_case such as `customer_id` and `customer_name_snapshot`; vague names like `ref_id` or `owner_id` are avoided when the referenced concept is known.
