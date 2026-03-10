This document defines the state management strategy of the frontend.

The application uses **Angular Signals as the primary state mechanism**.

Signals are preferred for:

- UI state
- derived state
- component state
- feature state

Observables remain valid for:

- asynchronous streams
- external APIs
- router events
- event streams

The goal is **predictable state, minimal side effects, and easy testability**.

---

# State Philosophy

State must be:

- explicit
- predictable
- easy to trace
- easy to test
- easy to refactor

Avoid hidden state mutations and implicit side effects.

State logic must remain understandable without reading the entire application.

---

# Signals as Primary State

Signals are the default mechanism for state in Angular components and feature logic.

Use:

- `signal()` for mutable state
- `computed()` for derived state
- `effect()` only for side effects

Example:

```ts
readonly players = signal<Player[]>([]);
readonly selectedPlayerId = signal<string | null>(null);

readonly selectedPlayer = computed(() =>
  this.players().find((p) => p.id === this.selectedPlayerId()) ?? null
);
```

## Signal Update Rules

Signals must be updated explicitly.

Allowed methods:

- `set()`
- `update()`

Example:

```ts
this.players.set(newPlayers);
```

or

```ts
this.players.update((players) => [...players, newPlayer]);
```

Forbidden:

- `mutate()`

Mutating signals directly leads to unpredictable state changes.

## Derived State

Derived values must use `computed()`.

Example:

```ts
readonly totalPlayers = computed(() => this.players().length);
```

Rules:

- Never duplicate derived values manually.
- If a value can be derived, it should not be stored as separate mutable state.
- Derived state must remain pure.

## Effects

Effects are only for side effects.

Examples:

- logging
- analytics
- synchronizing external systems
- reacting to route changes
- triggering infrastructure calls

Example:

```ts
effect(() => {
  console.log(this.selectedPlayer());
});
```

Rules:

- Avoid complex logic inside effects.
- Do not encode business rules inside effects.
- Avoid cascading effects.
- Prefer explicit state updates.
- If logic becomes complex, move it to a method or use case.

## Where State Should Live

State should live as close as possible to where it is used.

Hierarchy:

- Component local state
- Feature state
- Global application state (rare)

Avoid unnecessary global state.

Example:

```txt
Component
   ↓
Feature state service
   ↓
Application use cases
```

## Component State

Components can manage small UI state directly.

Examples:

- toggle states
- selected item
- filter inputs
- loading indicators

Example:

```ts
readonly isOpen = signal(false);
readonly filter = signal('');
```

Rules:

- Do not move trivial UI state to services.
- Keep component state small and clear.

## Feature State

Feature state should live in feature services.

Example:

```txt
players/
  application/
    players.state.ts
```

Responsibilities:

- coordinate signals
- manage feature-level state
- interact with use cases

Example:

```ts
export class PlayersState {
  readonly players = signal<Player[]>([]);
  readonly loading = signal(false);
}
```

Rules:

- Feature state services should not become large.
- Extract domain logic to use cases.
- Keep state services focused on state management.

## Global State

Global state should be minimal.

Possible global states:

- authenticated user
- application settings
- feature flags

Global state should live in:

```txt
core/state/
```

Avoid creating global stores unless truly necessary.

## Signals and Observables

Signals and observables serve different purposes.

Signals:

- synchronous state
- UI state
- derived values

Observables:

- asynchronous streams
- HTTP requests
- router events
- external event streams

Guideline:

- external async data → observable
- UI state → signal

## Converting Observables to Signals

When consuming APIs, it can be useful to convert observables to signals.

Example:

```ts
toSignal(apiCall$)
```

Rules:

- Convert at the presentation boundary.
- Avoid mixing signals and observables deep inside business logic.
- Keep conversions localized.

## Avoiding State Duplication

Duplicated state leads to bugs.

Bad example:

- players
- playersCount
- selectedPlayer
- selectedPlayerName

Better:

- players
- selectedPlayerId

Derived values:

- selectedPlayer
- playersCount

Always prefer derived state over duplicated state.

## State Immutability

State updates should remain immutable.

Bad:

```ts
players().push(newPlayer)
```

Good:

```ts
players.update((players) => [...players, newPlayer])
```

Rules:

- never mutate arrays or objects stored in signals
- always produce new references

## Side Effects and Infrastructure

Infrastructure interactions should not live directly inside state logic.

Example:

Bad:

```txt
Component
 → HTTP call
 → update state
```

Better:

```txt
Component
 → Use Case
 → Infrastructure Adapter
 → Update State
```

State services may coordinate updates, but they should not contain infrastructure logic.

## Error State

Errors should be represented explicitly.

Example:

```ts
readonly error = signal<string | null>(null);
```

Avoid:

- throwing UI-level exceptions
- hiding errors silently

UI should be able to react to error signals.

## Loading State

Loading should be explicit.

Example:

```ts
readonly loading = signal(false);
```

Pattern:

- set loading true
- execute use case
- update state
- set loading false

Avoid implicit loading detection.

## State Anti-Patterns

Avoid:

- global signal stores for everything
- nested signals
- signals storing large mutable objects
- side effects inside computed
- business rules inside effects
- duplicate state representations
- signals inside domain entities

## Testing State Logic

State logic must remain testable.

Rules:

- test state transitions
- test computed results
- avoid coupling tests to internal signal implementation
- test public behavior of state services

Prefer testing state services without Angular TestBed when possible.

## Performance Guidelines

Signals already optimize reactivity, but avoid:

- excessive computed chains
- unnecessary effects
- very large reactive graphs
- storing huge collections in a single signal when slicing could help

Prefer smaller reactive units.

## Refactoring State

Refactor when:

- state service becomes large
- too many signals exist in one place
- effects become difficult to follow
- multiple components depend on the same logic

Possible refactors:

- extract state service
- extract use case
- extract domain service
- simplify signal graph

## Output Expectations

When generating state logic for this project:

- use signals as the primary state mechanism
- keep state small and explicit
- avoid hidden side effects
- derive state with computed
- update signals immutably
- keep infrastructure outside state services
- keep logic easy to test
