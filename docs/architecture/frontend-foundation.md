# Frontend Foundation

## Why this baseline exists

The project is optimized for incremental delivery without rebuilding the foundation later. The current setup chooses explicitness over magic and keeps Angular inside the presentation edge of the system.

## Technical decisions

### Angular and state

- Standalone components are the default.
- `provideZonelessChangeDetection()` is enabled to align app runtime and tests.
- Signals are the default mechanism for UI and feature state.
- Feature providers are scoped at route level when they belong to one feature.

### Architecture

- `core` contains app-wide technical configuration.
- `layout` contains application shell concerns.
- `shared` contains feature-agnostic UI pieces.
- `features` contain all domain-driven code.
- Inside a feature, `ui` is the presentation adapter for the hexagon.

### Testing

- Jest is the unit/component runner.
- Angular Testing Library is the default for UI tests.
- The matches feature includes examples in domain, application and UI layers.
- New business behavior should start with a failing test.

### Styling

- ITCSS layers are centralized under `src/styles`.
- Sass settings define tokens; elements export them as CSS variables.
- Components should prefer CSS variables and local BEM selectors.
- Objects and utilities stay generic; feature-specific visuals stay with the feature component.

## File and naming guidance

- Files use kebab-case.
- Classes, components and use cases use business names: `PadelMatch`, `LoadUpcomingMatchesUseCase`, `UpcomingMatchesPageComponent`.
- Signals use noun-based names: `matches`, `isLoading`, `errorMessage`.
- Avoid vague names such as `helper`, `service`, `data` or `manager`.

## Golden path

`src/app/features/matches` demonstrates the intended workflow:

1. A pure domain entity exposes business rules.
2. An application use case depends on a repository port.
3. Infrastructure implements that port with an in-memory adapter.
4. A route-scoped provider graph wires the adapter to the use case.
5. A signal-based store prepares UI state.
6. The page coordinates loading and renders presentational components.

This pattern is the default until the project proves it needs something else.
