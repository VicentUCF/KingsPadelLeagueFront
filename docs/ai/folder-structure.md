This document defines the folder structure conventions for the frontend.

The project uses a **feature-first architecture combined with hexagonal architecture boundaries**.

The goal is to maintain:

- scalability
- discoverability
- low coupling
- clear ownership of code

Folder structure must support both:

- architectural separation
- feature isolation

---

# Root Structure

The root Angular application should follow this structure:

```txt
src/
app/
core/
shared/
features/
styles/
```

Responsibilities:

- **core** → application-wide technical concerns
- **shared** → reusable UI and utilities
- **features** → feature domains
- **styles** → global styling architecture (ITCSS)

---

# Core Folder

The `core` folder contains **global application infrastructure**.

Examples:

```txt
core/
config/
guards/
interceptors/
layout/
auth/
state/
```

Typical contents:

- application configuration
- route guards
- HTTP interceptors
- authentication logic
- layout components
- global state

Rules:

- Only place **application-wide concerns** here.
- Do not place feature logic here.
- Avoid turning `core` into a dumping ground.

---

# Shared Folder

The `shared` folder contains **generic reusable elements**.

Examples:

```txt
shared/
ui/
components/
directives/
pipes/
utils/
```

Examples of shared elements:

- generic UI components (buttons, inputs, modals)
- utility functions
- directives
- pipes
- generic helpers

Rules:

- Shared code must be **feature-agnostic**.
- Do not place business logic here.
- If code only belongs to one feature, keep it inside that feature.

---

# Features Folder

The `features` folder contains **all domain-driven features**.

Example:

```txt
features/
players/
teams/
matches/
standings/
market/
```

Each feature must be **self-contained**.

Features should contain their own:

- domain
- application logic
- infrastructure
- presentation

---

# Feature Internal Structure

Each feature must follow hexagonal architecture boundaries.

Example:

```txt
features/
players/
domain/
application/
infrastructure/
presentation/
```

---

# Domain Layer

Contains **pure business logic**.

Example:

```txt
players/
domain/
player.entity.ts
player.value-object.ts
player.rules.ts
```

Rules:

- No Angular imports.
- No infrastructure dependencies.
- Pure TypeScript logic only.

---

# Application Layer

Contains **use cases and orchestration logic**.

Example:

```txt
players/
application/
use-cases/
create-player.usecase.ts
load-players.usecase.ts
ports/
player.repository.port.ts
```

Responsibilities:

- coordinate domain behavior
- define ports
- orchestrate workflows

Rules:

- no Angular components
- no infrastructure implementations

---

# Infrastructure Layer

Contains **external integrations**.

Examples:

```txt
players/
infrastructure/
dto/
player.dto.ts
mappers/
player.mapper.ts
repositories/
player-api.repository.ts
```

Responsibilities:

- HTTP clients
- Supabase clients
- DTO mapping
- repository adapters

Rules:

- must implement ports defined in the application layer
- must not contain domain rules
- must not contain UI logic

---

# Presentation Layer

Contains **Angular UI logic**.

Example:

```txt
players/
presentation/
pages/
players-page/
components/
player-card/
view-models/
```

Responsibilities:

- Angular components
- UI state
- forms
- interaction handling

Rules:

- no domain rules
- no direct infrastructure access
- interact through use cases or services

---

# Page Components

Pages represent **route-level components**.

Example:

```txt
presentation/
pages/
players-page/
players-page.component.ts
players-page.component.html
players-page.component.scss
```

Responsibilities:

- coordinate feature UI
- interact with use cases
- manage page-level state

---

# Presentational Components

Components responsible only for rendering UI.

Example:

```txt
presentation/
components/
player-card/
```

Rules:

- receive data via inputs
- emit events via outputs
- contain no business logic

---

# View Models

View models adapt domain data for UI usage.

Example:

```txt
presentation/
view-models/
player.viewmodel.ts
```

Responsibilities:

- shape data for templates
- remove backend or domain complexity
- provide UI-friendly data structures

---

# Routing

Each feature may define its own routes.

Example:

```txt
players/
presentation/
routes.ts
```

Routes should be **lazy loaded**.

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

---

# Global Styles

Global styles follow the ITCSS structure.

Example:

```txt
styles/
  settings/
  tools/
  generic/
  elements/
  objects/
  components/
  utilities/
```

See `styling.md` for details.

---

# Naming Conventions

Folders should use:

- kebab-case

Example:

- player-card
- players-page
- match-result-form

Files should follow Angular conventions.

Examples:

- player-card.component.ts
- player-card.component.scss
- player-card.component.html

---

# Import Rules

Avoid deep imports across features.

Bad:

```txt
features/players/domain/player.entity
```

from another feature.

Better:

- expose public interfaces via feature-level APIs if necessary.

Rules:

- avoid cross-feature imports when possible
- features should remain loosely coupled

---

# Feature Isolation

Features must remain isolated.

Avoid:

- cross-feature dependencies
- direct imports into another feature's infrastructure or domain

Shared logic must be moved to:

```txt
shared/
```

only if truly generic.

---

# File Size Guidelines

Recommended limits:

- Components < 200 lines
- Services < 200 lines
- Domain entities < 150 lines
- SCSS files < 200 lines

If exceeded:

- split components
- extract services
- extract mappers
- extract utilities

---

# When to Create a New Feature

Create a new feature when:

- a domain concept becomes complex
- it has its own UI
- it has its own domain rules
- it interacts with multiple layers

Example features for this project:

- players
- teams
- matches
- standings
- market
- auth

---

# Anti-Patterns

Avoid the following:

- dumping everything in shared
- giant components
- giant services
- domain logic inside Angular components
- direct HTTP calls inside components
- cross-feature tight coupling
- global utilities with mixed responsibilities

---

# Refactoring Folder Structure

Refactor when:

- a feature becomes too large
- a folder contains unrelated responsibilities
- files become difficult to locate
- cross-feature imports start appearing

Possible refactors:

- split feature into sub-features
- extract domain services
- extract shared utilities

---

# Output Expectations

When generating code:

- follow the feature-first structure
- respect hexagonal architecture layers
- keep features isolated
- keep files small and focused
- avoid cross-feature coupling
- keep domain logic framework-agnostic
