This document defines how frontend code must interact with backend contracts.

- Do not expose backend response shapes directly to UI or domain layers.
- Define DTOs and infrastructure mappers at the edge of each feature.
- Application and domain layers must consume frontend-owned models.
- Repository ports describe capabilities, not HTTP payloads.
- Normalize nullable and optional fields in infrastructure before they reach the rest of the system.
- Keep transport concerns out of components and domain objects.
