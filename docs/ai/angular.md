This document defines the Angular-specific development rules for the frontend.

All Angular code must be modern, maintainable, testable, accessible, and aligned with the architectural boundaries defined in `architecture.md`.

Angular must be used as a UI framework, not as a place to concentrate business logic.

---

# General Angular Rules

- Always use standalone components.
- Do NOT set `standalone: true` inside decorators. It is the default in Angular v20+.
- Prefer feature-based organization.
- Respect hexagonal architecture boundaries at all times.
- Keep Angular concerns inside the presentation layer unless there is a justified technical reason.
- Prefer explicit, readable code over Angular cleverness.

---

# Components

Components must be small, focused, and easy to understand.

Rules:

- Every component must have a single clear responsibility.
- Use `ChangeDetectionStrategy.OnPush` in every `@Component`.
- Use `input()` and `output()` instead of decorators.
- Use `host` inside the decorator instead of `@HostBinding` or `@HostListener`.
- Prefer presentational components for rendering.
- Use container components or page components to orchestrate use cases and UI state.
- Avoid bloated smart components.
- Extract child components when a template or class starts growing too much.
- Do not place business rules inside components.
- Do not place infrastructure access inside components.

Recommended split:

- **Page components**: orchestration, route-level state, use case calls
- **Presentational components**: receive data, emit UI events, render UI
- **Shared UI components**: generic reusable visual building blocks

---

# Component File Strategy

Use external files for medium and large components.

Recommended structure:

```txt
feature-name/
  presentation/
    pages/
      players-page/
        players-page.component.ts
        players-page.component.html
        players-page.component.scss
        players-page.component.spec.ts
    components/
      player-card/
        player-card.component.ts
        player-card.component.html
        player-card.component.scss
        player-card.component.spec.ts
```

Rules:

- Prefer inline templates only for truly small components.
- Prefer inline styles only for trivial styling.
- Use paths relative to the component TypeScript file.
- Keep component files focused and small.

## Change Detection

Use `ChangeDetectionStrategy.OnPush` everywhere.

Rules:

- Treat component inputs as immutable values.
- Avoid hidden mutable state.
- Prefer signals and computed state over ad hoc mutation.
- Reduce unnecessary re-renders by keeping template logic simple.

Example:

```ts
@Component({
  selector: 'app-player-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {}
```

## Inputs and Outputs

Use function-based APIs.

Rules:

- Use `input()` for inputs
- Use `output()` for outputs
- Avoid decorator-based `@Input()` / `@Output()` unless there is a hard compatibility reason

Example:

```ts
readonly player = input.required<PlayerViewModel>();
readonly selected = output<string>();
```

## Dependency Injection

Use `inject()` instead of constructor injection.

Rules:

- Keep injected dependencies minimal.
- Do not inject services that are not directly needed.
- Prefer injecting use cases or application-facing services inside page/container components.
- Avoid injecting infrastructure implementations directly into components.

Example:

```ts
private readonly loadPlayersUseCase = inject(LoadPlayersUseCase);
```

## Templates

Templates must remain simple and declarative.

Rules:

Use native control flow:

- `@if`
- `@for`
- `@switch`

Do not use:

- `*ngIf`
- `*ngFor`
- `*ngSwitch`

- Use `track` in every `@for` when rendering collections.
- Keep conditions simple.
- Do not place complex logic in templates.
- Do not write arrow functions in templates.
- Do not assume global constructors like `Date` are available in templates.
- Prepare view models in TypeScript instead of computing complex values in HTML.

Good:

```html
@if (players().length) {
<ul class="players-list">
  @for (player of players(); track player.id) {
  <li>
    <app-player-card [player]="player" />
  </li>
  }
</ul>
} @else {
<p>No players found.</p>
}
```

Bad:

- nested conditional chains
- inline mapping logic
- repeated expressions
- business calculations in the template

## Signals

Signals are the default state mechanism in Angular code.

Rules:

- Use `signal()` for local mutable state.
- Use `computed()` for derived state.
- Use `effect()` only for real side effects.
- Prefer explicit state transitions.
- Do NOT use `mutate()` on signals.
- Use `set()` or `update()` instead.
- Keep signal state minimal and intentional.

Example:

```ts
readonly players = signal<PlayerViewModel[]>([]);
readonly selectedPlayerId = signal<string | null>(null);

readonly selectedPlayer = computed(() =>
  this.players().find((player) => player.id === this.selectedPlayerId()) ?? null
);
```

## Effects

Use `effect()` with discipline.

Rules:

- Only use effects for synchronization or side effects.
- Do not use effects as hidden business logic containers.
- Do not chain effects in confusing ways.
- If logic becomes hard to follow, move it to a dedicated method or use case.

Bad uses of effects:

- updating several unrelated states
- encoding business rules
- replacing proper event handlers or explicit state flow

## Observables and Signals

Signals are preferred for UI state, but observables remain valid for async streams and external data sources.

Rules:

Use observables for:

- HTTP streams
- route params
- external async event streams

- Convert observables to signals at the presentation boundary when appropriate.
- Do not mix signals and observables carelessly.
- Keep conversions explicit and localized.

Guideline:

- external async flow → observable
- UI state and derived state → signal

## Routing

Use lazy loading for features.

Rules:

- Every major feature must be lazy loaded.
- Route configuration must remain clear and shallow.
- Keep route guards focused.
- Avoid route files that become giant configuration dumps.

Recommended structure:

```txt
features/
  players/
    presentation/
      routes.ts
```

Example:

```ts
export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/players-page/players-page.component').then((m) => m.PlayersPageComponent),
  },
];
```

## Forms

Use Reactive Forms.

Rules:

- Do not use Template-driven Forms.
- Prefer typed Reactive Forms.
- Keep validation explicit.
- Put reusable validators outside components.
- Do not bury form logic inside large component classes.
- Provide accessible labels, hints, and error messages.

Recommended approach:

- page component owns form setup
- validation rules are reusable
- submit handling delegates to use cases

## HTTP and Data Access

Components must not call APIs directly.

Rules:

- Page/container components call use cases or application services.
- Infrastructure handles HTTP/Supabase access.
- DTO mapping must not happen inside templates or presentational components.
- Do not leak raw backend response models into UI components.

## Host Bindings and Events

Do NOT use `@HostBinding` or `@HostListener`.

Use the `host` property instead.

Example:

```ts
@Component({
  selector: 'app-button',
  host: {
    '[class.app-button]': 'true',
    '(click)': 'handleClick()',
  },
})
export class AppButtonComponent {
  handleClick(): void {}
}
```

## Image Handling

Use `NgOptimizedImage` for static images.

Rules:

- Every static image must use `NgOptimizedImage`.
- Do not use it for inline base64 images.
- Always provide meaningful alt text unless the image is purely decorative.
- Decorative images must be marked appropriately.

## Accessibility in Angular Components

Accessibility is mandatory in component design.

Rules:

- Use semantic HTML first.
- Ensure keyboard interaction works correctly.
- Do not fake buttons or links with generic elements.
- Inputs must be associated with labels.
- Error messages must be connected to fields.
- Focus order must be logical.
- Dynamic UI changes must remain accessible.

Angular-specific guidance:

- dialogs must manage focus correctly
- menus must support keyboard navigation
- tables must remain understandable to screen readers
- form errors must be exposed accessibly

See `accessibility.md` for full rules.

## Styling Integration

Angular components must integrate with the SCSS architecture defined in `styling.md`.

Rules:

- Keep component styles scoped and predictable.
- Use BEM naming for component classes.
- Do not create deep nested selectors.
- Do not mix layout objects and component-specific styles carelessly.
- Shared styling abstractions must live in the correct ITCSS layer.

## Testing Angular Code

Angular components must be testable by design.

Rules:

- Keep logic small so it can be tested easily.
- Avoid hidden side effects.
- Prefer testing behavior over implementation details.

Component tests must validate:

- rendering
- interaction
- accessibility-critical behavior
- emitted outputs

Use domain and use case tests for business rules instead of pushing that responsibility into component tests.

See `testing.md` for testing strategy.

## File Size and Complexity Limits

Recommended limits:

- Component class: under 200 lines
- Template: under 150 lines
- SCSS file: under 200 lines

If a file becomes hard to scan, split it.

Refactor by extracting:

- child components
- mappers
- view-model builders
- validators
- helper functions
- use cases

## Anti-Patterns to Avoid

Do not introduce:

- business logic inside components
- raw API calls inside components
- giant page components
- giant templates
- giant reactive forms in one file
- infrastructure-specific code in presentation
- uncontrolled subscriptions
- unnecessary effects
- decorator-heavy legacy Angular patterns
- shared god components that solve unrelated problems

## Output Expectations

When generating Angular code for this project:

- use standalone APIs
- use signals for UI state
- use OnPush change detection
- keep templates simple
- keep components small
- respect architectural boundaries
- use Reactive Forms
- keep code accessible
- keep files maintainable
- extract complexity early
