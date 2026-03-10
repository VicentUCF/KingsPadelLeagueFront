# AGENTS.md

This file defines the **global development rules** for the frontend codebase.

All generated code must follow the standards described here and in the specialized documents referenced below.

This project prioritizes:

- maintainability
- scalability
- testability
- accessibility
- clear architecture
- predictable styling
- small, focused code units

If a tradeoff must be made between **speed and long-term maintainability**, prefer maintainability unless it blocks delivery.

---

# Core Principles

All code must follow these fundamental principles:

- Keep files **small and focused**.
- Avoid large components, services, or stylesheets.
- Maintain **low coupling and high cohesion**.
- Avoid duplication.
- Prefer explicit and readable code over clever abstractions.
- Favor **composition over inheritance**.
- Keep business logic outside UI components.
- Maintain strict separation between **domain logic and framework code**.

Refactoring must follow principles from:

https://refactoring.guru/

Common refactoring practices include:

- Extract Method
- Extract Class
- Remove Duplication
- Replace Magic Numbers with Named Constants
- Replace Conditional Complexity with better modeling
- Rename unclear symbols
- Break large files into smaller cohesive units

Code should never be left worse than it was found.

---

# Architecture

This project follows **Hexagonal Architecture (Ports and Adapters)**.

The frontend must respect the following layers:

- **Domain**
- **Application**
- **Infrastructure**
- **Presentation**

Rules:

- Domain contains pure business logic.
- Domain must not depend on Angular.
- Application orchestrates domain behavior through use cases.
- Infrastructure handles external integrations.
- Presentation (Angular) handles UI concerns only.

UI components must not contain domain rules.

More details:  
See `docs/ai/architecture.md`

---

# Development Model

The project follows **TDD (Test-Driven Development)**.

Process:

1. Write a failing test.
2. Implement the minimum code to pass.
3. Refactor.
4. Ensure tests remain green.

Every business rule must have tests.

See `docs/ai/testing.md`.

---

# Angular Development

Angular code must follow modern Angular standards:

- Standalone components
- Signals for state
- OnPush change detection
- Lazy loaded feature routes

More detailed rules are defined in:

`docs/ai/angular.md`

---

# TypeScript Standards

Type safety is mandatory.

Rules include:

- strict typing
- no `any`
- explicit domain modeling
- small focused types
- immutable patterns when possible

See:

`docs/ai/typescript.md`

---

# State Management

State must primarily use **Angular signals**.

Guidelines include:

- signals for state
- computed for derived state
- predictable updates
- minimal side effects

See:

`docs/ai/state-management.md`

---

# Styling System

The styling architecture uses:

**SCSS + ITCSS + BEM**

Goals:

- predictable cascade
- low specificity
- scalable styles
- reusable abstractions

Full rules:

`docs/ai/styling.md`

---

# Accessibility

Accessibility is **not optional**.

The application must:

- pass AXE checks
- comply with WCAG AA minimum standards
- ensure keyboard accessibility
- ensure proper semantic HTML usage

See:

`docs/ai/accessibility.md`

---

# Folder Structure

The project follows a **feature-first structure** combined with architectural boundaries.

Rules are defined in:

`docs/ai/folder-structure.md`

---

# Refactoring Standards

Refactoring is mandatory during development.

Files should remain:

- readable
- small
- well separated
- easy to navigate

Guidelines:

`docs/ai/refactoring.md`

---

# Naming Conventions

Naming must reflect **business meaning and intent**.

Avoid vague names such as:

- data
- helper
- manager
- utils

See:

`docs/ai/naming.md`

---

# Backend Contracts

Frontend must not depend directly on backend response structures.

Use:

- DTOs
- mappers
- adapters

Details:

`docs/ai/backend-contracts.md`

---

# Task-Based Rule Loading

When working on a specific task, load the relevant rule files.

| Task Type                | Required Documents   |
| ------------------------ | -------------------- |
| Architecture changes     | architecture.md      |
| Angular components       | angular.md           |
| Type modeling            | typescript.md        |
| State logic              | state-management.md  |
| Styling work             | styling.md           |
| Accessibility work       | accessibility.md     |
| Testing work             | testing.md           |
| Refactoring work         | refactoring.md       |
| Folder structure changes | folder-structure.md  |
| API integration          | backend-contracts.md |

Always apply **AGENTS.md rules first**, then the specialized document.

---

# Code Generation Expectations

When generating code:

- Respect hexagonal architecture.
- Produce production-grade code.
- Keep files small and focused.
- Follow ITCSS + BEM for styles.
- Use signals for state.
- Include tests when implementing behavior.
- Ensure accessibility is preserved.
- Apply refactoring when structure becomes unclear.

Code should always prioritize **clarity, maintainability, and correctness**.
