This document defines the architectural rules of the frontend.

The project follows **Hexagonal Architecture (Ports and Adapters)** adapted for Angular applications.

The main objective is to separate **business logic from frameworks and infrastructure**.

Angular is treated as a **delivery mechanism**, not as the core of the application.

---

# Architectural Overview

The system is divided into four main layers:

- Domain
- Application
- Infrastructure
- Presentation

Dependency flow must always go **inward**:

- Presentation → Application → Domain
- Infrastructure → Application → Domain

The **Domain layer must never depend on Angular or infrastructure code**.

---

# Layer Responsibilities

## Domain

The **Domain layer** contains pure business logic.

It must be completely independent of Angular and external frameworks.

Allowed contents:

- Entities
- Value Objects
- Domain services
- Business rules
- Domain errors
- Domain events (if needed)

Domain rules:

- Must be framework agnostic.
- Must be fully testable without Angular.
- Must not import infrastructure libraries.
- Must avoid external dependencies whenever possible.

Example structure:

```txt
players/domain/
player.entity.ts
player.value-object.ts
player.rules.ts
```

---

## Application

The **Application layer** coordinates domain logic.

It represents **use cases** of the system.

Responsibilities:

- Orchestrate domain behavior
- Define application services
- Define ports (interfaces)
- Handle workflows
- Map between UI models and domain models

Allowed contents:

- Use cases
- Application services
- Port definitions
- DTO transformations if necessary

Example:

```txt
players/application/
use-cases/
create-player.usecase.ts
update-player.usecase.ts
ports/
player.repository.port.ts
```

Rules:

- Must not depend on Angular components.
- Must not contain UI logic.
- Must not implement infrastructure details.

---

## Infrastructure

The **Infrastructure layer** implements the ports defined in the application layer.

Responsibilities:

- API calls
- persistence adapters
- Supabase integrations
- DTO mapping
- serialization

Example:

```txt
players/infrastructure/
repositories/
supabase-player.repository.ts
mappers/
player.mapper.ts
dto/
player.dto.ts
```

Rules:

- Infrastructure must implement ports defined by the application layer.
- Infrastructure must not contain domain rules.
- Infrastructure must not contain UI code.

---

## Presentation

The **Presentation layer** is the Angular UI.

Responsibilities:

- Rendering views
- Managing UI state
- Handling user interaction
- Calling use cases

Contents:

- Angular components
- pages
- view models
- form logic
- UI signals

Example:

```txt
players/presentation/
pages/
players-page.component.ts
components/
player-card.component.ts
view-models/
player.viewmodel.ts
```

Rules:

- Components must not contain domain rules.
- Components must not access infrastructure directly.
- Components must communicate through **use cases or services from the application layer**.

---

# Feature-Based Organization

The project follows a **feature-first structure**.

Example:

```txt
src/app/features/

players/
domain/
application/
infrastructure/
presentation/

teams/
domain/
application/
infrastructure/
presentation/

matches/
domain/
application/
infrastructure/
presentation/
```

Each feature is **self-contained**.

Rules:

- Features must avoid cross-feature dependencies whenever possible.
- Shared logic must be placed in **core or shared modules only when truly generic**.

---

# Core vs Shared

## Core

`core` contains application-wide technical concerns.

Examples:

```txt
core/
guards
interceptors
config
layout
auth
```

Rules:

- Only cross-application infrastructure belongs here.

---

## Shared

`shared` contains reusable UI or utilities.

Examples:

```txt
shared/
ui-components
pipes
directives
utilities
```

Rules:

- Must remain generic.
- Must not contain domain-specific logic.

---

# Use Case Flow

Typical interaction flow:

```txt
UI Component
↓
Use Case
↓
Domain Logic
↓
Repository Port
↓
Infrastructure Adapter
↓
External System (API / Supabase)
```

Example:

```txt
CreatePlayerPageComponent
↓
CreatePlayerUseCase
↓
PlayerRepositoryPort
↓
SupabasePlayerRepository
↓
Supabase API
```

---

# Ports and Adapters

Ports define **capabilities**, not implementations.

Example port:

- `PlayerRepository`

Infrastructure provides implementations:

- `SupabasePlayerRepository`
- `HttpPlayerRepository`
- `MockPlayerRepository`

This allows:

- testing use cases easily
- switching infrastructure without breaking domain logic

---

# Dependency Rules

Allowed dependencies:

- Presentation → Application
- Application → Domain
- Infrastructure → Application
- Infrastructure → Domain

Forbidden dependencies:

- Domain → Angular
- Domain → Infrastructure
- Application → Angular Components
- Presentation → Infrastructure directly

---

# Domain Isolation

Domain must remain isolated from framework concerns.

Do NOT import:

- `@angular/*`
- `rxjs`
- http libraries
- supabase client

Domain must remain pure TypeScript.

---

# Testing Strategy per Layer

## Domain tests

- Pure unit tests
- No Angular TestBed
- Fast execution

## Application tests

- Use case tests
- Mock ports

## Infrastructure tests

- Integration tests where needed

## Presentation tests

- Component tests
- UI behavior validation

---

# Common Architectural Violations

Avoid the following patterns:

- Domain logic inside components
- Direct API calls inside components
- Infrastructure leaking into UI
- God services handling multiple responsibilities
- Shared folders acting as dumping grounds
- Circular dependencies between features

---

# File Size Guidelines

To keep architecture maintainable:

Recommended limits:

- Components: < 200 lines
- Services: < 200 lines
- Domain entities: < 150 lines
- SCSS files: < 200 lines

If a file grows beyond this, refactor by extracting:

- smaller components
- domain services
- helper classes
- mappers

---

# Evolution Strategy

The architecture must evolve incrementally.

Rules:

- Do not introduce abstraction before it is needed.
- Prefer simple solutions first.
- Extract layers when complexity grows.
- Refactor continuously.

Architecture should support growth **without creating premature complexity**.
