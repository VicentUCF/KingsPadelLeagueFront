This document defines the TypeScript rules for the frontend.

- Keep strict typing enabled at all times.
- Do not use `any`.
- Prefer explicit domain types over loose object literals.
- Use immutable `readonly` shapes where possible.
- Encode domain meaning in types instead of comments.
- Keep type files focused and close to the feature they belong to.
- Avoid leaking framework or transport types into domain code.
- Use path aliases only to improve clarity, not to hide poor boundaries.
