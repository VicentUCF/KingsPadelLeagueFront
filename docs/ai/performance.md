This document defines the frontend performance standards.

Performance is a product requirement, not a later optimization phase.

The goal is to build an application that is:

- fast to load
- fast to interact with
- efficient to render
- scalable as features grow
- resilient on low-end devices and poor networks

Performance decisions must be made during architecture, implementation, and review.

---

# Performance Principles

The codebase must prioritize:

- minimal work per render
- minimal unnecessary state updates
- minimal bundle size growth
- lazy loading by default
- efficient change detection
- efficient asset delivery

Performance improvements must not compromise:

- accessibility
- maintainability
- architectural clarity

---

# Angular Rendering Rules

Use Angular in a way that minimizes unnecessary rendering work.

Rules:

- Always use `ChangeDetectionStrategy.OnPush`.
- Keep templates simple.
- Avoid complex expressions in templates.
- Avoid calling expensive methods from templates.
- Prefer precomputed view models when rendering becomes complex.
- Split large pages into smaller components.
- Keep reactive graphs small and understandable.

---

# Signals Performance Rules

Signals are efficient, but poor usage still creates unnecessary work.

Rules:

- Use `signal()` only for real mutable state.
- Use `computed()` for derived state.
- Do not duplicate derived state as writable state.
- Keep computed chains shallow and meaningful.
- Avoid effects that trigger broad update cascades.
- Avoid storing very large mutable objects in one signal when smaller slices are possible.

Bad:

- one massive signal holding unrelated UI state
- effects updating several other signals indirectly
- duplicated signals for values that can be derived

Good:

- small focused signals
- explicit updates
- computed values for derived state

---

# Effects Discipline

Effects can easily become a hidden performance problem.

Rules:

- Use `effect()` only for real side effects.
- Do not use effects for business logic orchestration.
- Do not chain effects unnecessarily.
- Avoid effects that react to broad state and trigger more writes.
- Keep effects small, explicit, and easy to reason about.

If an effect causes repeated or indirect updates, reconsider the design.

---

# Template Performance

Templates must remain lightweight.

Rules:

- Use native control flow (`@if`, `@for`, `@switch`).
- Always use `track` in `@for` loops when rendering collections.
- Do not place filtering, sorting, or mapping logic directly in templates.
- Do not call heavy methods in bindings.
- Avoid repeated deep property access if a view model can simplify the template.
- Avoid large templates with repeated conditional blocks.

Bad:

```html
@for (player of players().filter(p => p.active).sort(sortPlayers); track player.id) {
```

Good:

- prepare filtered and sorted data in TypeScript or computed state
- keep the template declarative

---

# List Rendering

Lists are one of the main rendering hot spots.

Rules:

- Always provide stable identifiers in `@for ... track`.
- Never rely on object identity when a real ID exists.
- Avoid rerendering large lists unnecessarily.
- Use pagination or chunking if lists become large.
- Extract item rendering into child components when useful.

Example:

```html
@for (player of players(); track player.id) {
<app-player-card [player]="player" />
}
```

---

# Component Size and Render Boundaries

Large components tend to rerender too much and become hard to optimize.

Rules:

- Keep components small and focused.
- Extract child components for repeated or independent UI sections.
- Keep route pages as orchestration layers, not rendering monoliths.
- Use presentational components to reduce rendering complexity.

Refactor when:

- one page contains too many unrelated UI sections
- one component handles too many independent concerns
- rerender boundaries are unclear

---

# Lazy Loading

Lazy loading is mandatory for feature routes.

Rules:

- Every major feature must be lazy loaded.
- Do not eagerly load large feature trees unless justified.
- Keep route definitions small and explicit.
- Do not place unnecessary imports in root-level startup paths.

Priority lazy-loaded features for this project may include:

- players
- teams
- matches
- standings
- market
- admin

---

# Bundle Size Discipline

Bundle size growth must be controlled.

Rules:

- Prefer native Angular capabilities before adding libraries.
- Do not add dependencies for trivial problems.
- Avoid large utility libraries when a focused helper will do.
- Be skeptical of UI libraries that add broad unused code.
- Import only what is needed.
- Remove dead code and unused dependencies quickly.

Before adding a dependency, ask:

- does Angular or TypeScript already solve this?
- is this dependency worth its bundle and maintenance cost?
- is the problem frequent enough to justify it?

---

# RxJS and Async Performance

Observables are valid for async streams, but misuse creates noise and overhead.

Rules:

- Use observables for real async/event streams.
- Convert to signals at the presentation boundary when appropriate.
- Avoid overengineering observable chains for simple state problems.
- Prefer clear async flows over deeply nested reactive pipelines.
- Clean up unnecessary subscriptions and conversions.
- Do not use RxJS complexity where signals are enough.

---

# Network Performance

The application should minimize unnecessary network work.

Rules:

- Avoid duplicate requests for the same screen state.
- Cache where appropriate at the application boundary.
- Keep API payloads focused.
- Avoid overfetching when the screen only needs a subset of data.
- Load only what is needed for the current feature.
- Frontend models should be shaped for UI needs, not raw backend convenience.

---

# Asset Performance

Assets must be optimized.

Rules:

- Use NgOptimizedImage for static images.
- Always provide correct image sizes when possible.
- Prefer modern image formats when supported.
- Avoid oversized images.
- Do not load decorative assets unnecessarily.
- Keep icon strategy efficient and consistent.
- Avoid shipping heavy media in the critical rendering path.

---

# CSS Performance

CSS architecture affects maintainability first, but it also affects runtime behavior.

Rules:

- Keep selectors shallow.
- Avoid deep nesting.
- Avoid expensive selector patterns.
- Prefer class selectors.
- Keep component styles small and scoped.
- Avoid broad global overrides.
- Use ITCSS and BEM consistently to keep styles predictable and cheap to evaluate.

See `styling.md`.

---

# Forms Performance

Forms can become expensive if poorly structured.

Rules:

- Split large forms into logical sections or child components.
- Avoid one giant page component handling all form logic.
- Keep validation explicit and localized.
- Avoid excessive reactive recalculation in templates.
- Prefer typed reactive forms and clear update flows.
- If a form becomes large, refactor into smaller parts.

---

# Data Transformation

Data transformation should happen in the right place.

Rules:

- Map DTOs in infrastructure.
- Shape UI-ready data in view models or computed state.
- Do not repeatedly transform the same data in templates.
- Avoid repeating sort/filter/map work on every render.
- Compute once at the appropriate boundary, then render.

---

# Performance and Architecture

Performance must respect architecture.

Do not "optimize" by:

- moving business logic into templates
- skipping proper mapping boundaries
- leaking infrastructure details into components
- centralizing everything into one giant state container

Fast code with broken architecture usually becomes slow to change.

---

# Performance Testing and Monitoring

Performance should be checked during development.

Use practical checks such as:

- Angular DevTools when helpful
- browser performance tools
- bundle analysis when growth becomes noticeable
- render profiling for heavy pages

Focus on real bottlenecks, not imagined micro-optimizations.

---

# Premature Optimization

Do not optimize blindly.

Rules:

- solve obvious waste early
- avoid speculative performance abstractions
- measure before complex optimization
- optimize hotspots, not everything

Good engineering removes waste without making the code harder to understand.

---

# Performance Smells

Common signs of performance problems:

- repeated unnecessary API calls
- large templates doing too much work
- missing track in loops
- large components rerendering unrelated UI
- too many effects
- duplicated derived state
- large bundles from unnecessary libraries
- excessive transformation logic in templates
- global state updates causing broad rerenders

When these appear, refactor early.

---

# Performance Review Checklist

Before shipping relevant UI changes, verify:

- feature route is lazy loaded
- component uses OnPush
- lists use track
- template logic is lightweight
- signals are not duplicated unnecessarily
- effects are minimal
- no obvious duplicate requests exist
- images are optimized
- large views are split appropriately

---

# Output Expectations

When generating code:

- prioritize small render surfaces
- use OnPush
- use signals carefully
- keep templates cheap
- lazy load features
- minimize unnecessary dependencies
- avoid duplicate async work
- optimize lists and assets
- preserve maintainability while improving runtime efficiency
