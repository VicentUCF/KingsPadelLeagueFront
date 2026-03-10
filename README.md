# Padel Fantasy Frontend

Angular 21 frontend foundation prepared for serious feature work: hexagonal architecture, strict TypeScript, signals-first UI state, SCSS with ITCSS, Jest, Testing Library and team-oriented tooling.

## Quick start

```bash
npm install
npm start
```

Open `http://localhost:4200`.

## Scripts

```bash
npm run start          # Angular dev server
npm run build          # Production build
npm run build:watch    # Build in watch mode
npm run lint           # ESLint on app source
npm run lint:fix       # ESLint autofix
npm run format         # Prettier write
npm run format:check   # Prettier check
npm run typecheck      # TypeScript app + test projects
npm run test           # Jest once
npm run test:watch     # Jest watch mode
npm run test:coverage  # Jest with coverage
npm run test:ci        # CI-oriented Jest run
npm run validate       # Lint + typecheck + tests + build
```

## Tooling baseline

- ESLint with `angular-eslint` flat config and accessibility template rules.
- Prettier + EditorConfig for formatting consistency.
- Husky + lint-staged for pre-commit checks.
- Commitlint with Conventional Commits.
- Path aliases in `tsconfig.json` for `@core`, `@layout`, `@shared`, `@features`, `@styles` and `@testing`.
- Jest + `jest-preset-angular` + `@testing-library/angular`.

## Architecture

The application uses a feature-first hexagonal structure:

```txt
src/app/
  core/
  layout/
  shared/
  features/
```

Inside each feature:

```txt
feature/
  domain/
  application/
  infrastructure/
  ui/
```

`ui` is the Angular presentation adapter. Domain stays framework-free, application contains use cases and ports, infrastructure implements adapters, and UI orchestrates user-facing state without embedding business rules.

The example feature lives in `src/app/features/matches` and is the reference implementation to copy from.

## Styling

Global styles live in `src/styles` and follow ITCSS:

```txt
settings -> tools -> generic -> elements -> objects -> components -> utilities
```

- Design tokens are defined in Sass settings and exposed as CSS custom properties.
- Layout abstractions use `o-*`.
- Reusable global components use `c-*`.
- Utilities use `u-*`.
- Component-local styles use BEM naming inside each component stylesheet.

Import order is centralized in `src/styles.scss`. Avoid importing whole global layers inside component styles.

## Testing

The project is prepared for TDD:

- Domain tests for pure rules.
- Application tests for use-case orchestration.
- Angular component/page tests with Testing Library.
- Jest runs in a zoneless Angular test environment to match the app baseline.

Playwright is intentionally deferred. Add it later only for critical end-to-end flows.

## Conventions

- Standalone components only.
- `ChangeDetectionStrategy.OnPush` everywhere.
- Use `input()` and `output()` APIs.
- Prefer `inject()` over constructor injection in Angular code.
- Keep business logic in domain/application, never in components.
- Feature state should use signals and computed values, with effects reserved for real side effects.
- Repositories are ports in application and adapters in infrastructure.

Additional project notes live in [frontend-foundation.md](docs/architecture/frontend-foundation.md).
