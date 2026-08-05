# Global success response interceptor

Successful JSON API responses are wrapped by a global response interceptor rather than manually assembled in controllers. Controllers return response DTOs or data objects, and the interceptor produces the standard `success`, `data`, and `meta` envelope while skipping non-standard responses such as manual responses, streams, downloads, health checks, and no-content endpoints.
