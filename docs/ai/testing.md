This document defines the testing strategy for the frontend.

The project follows **TDD (Test-Driven Development)**.

The testing stack is:

- **Jest**
- **Testing Library**
- **Playwright** for E2E in a later phase

At this stage, the priority is **unit and component testing with Jest and Testing Library**.

Testing is not optional.  
Every relevant business rule and every important UI behavior must be protected by tests.

---

# Testing Goals

The test suite must help guarantee:

- correctness
- confidence during refactoring
- architectural safety
- regression prevention
- maintainable development speed

Tests must support change, not block it.

---

# Development Model: TDD

All new behavior must follow TDD.

Workflow:

1. Write a failing test.
2. Implement the minimum code necessary to make it pass.
3. Refactor.
4. Keep tests green.

Rules:

- Do not skip the failing test step.
- Do not write production code without a test driving it first for new business behavior.
- Do not stop once the test passes; refactor is mandatory.
- Every bug fix must include a regression test.

---

# Current Testing Scope

## Included now

- Domain unit tests
- Application/use-case tests
- Utility and mapper tests
- Angular component tests
- Angular page/container tests where valuable

## Deferred for later

- End-to-end tests with Playwright
- Full user flow browser automation
- Cross-browser validation

When Playwright is introduced, it must cover only critical flows, not everything.

---

# Testing Pyramid

The project should follow this priority:

1. **Domain tests**
2. **Application/use-case tests**
3. **Component tests**
4. **Integration tests where needed**
5. **E2E tests later**

Most tests should live in the lower levels.

Rules:

- Prefer many fast unit tests over a small number of heavy integration tests.
- Do not push business validation into E2E.
- Do not overuse Angular TestBed for logic that belongs outside Angular.

---

# Testing by Architectural Layer

## Domain Layer

Domain tests are the highest priority.

What to test:

- entities
- value objects
- business rules
- domain services
- calculations
- invariants
- edge cases

Rules:

- Domain tests must be framework-agnostic.
- Do not use Angular TestBed here.
- Do not mock pure domain logic.
- Domain tests must be fast and deterministic.

Example targets:

- market value calculations
- standings rules
- match result validation
- player constraints

---

## Application Layer

Use-case tests verify orchestration and interaction between layers.

What to test:

- use case behavior
- port interactions
- success and failure scenarios
- workflow orchestration
- mapping between domain and application boundaries when relevant

Rules:

- Mock ports, not domain logic.
- Verify behavior, not implementation details.
- Keep tests focused on one use case at a time.

Example targets:

- create player use case
- close round use case
- update market values use case
- register match result use case

---

## Infrastructure Layer

Test infrastructure selectively.

What to test:

- mappers
- DTO conversions
- adapter contracts
- repository behavior when valuable

Rules:

- Do not overtest framework plumbing.
- Focus on logic that can break and produce real bugs.
- Prefer narrow tests around mappers and adapters.

Example targets:

- Supabase DTO to domain mapping
- API response normalization
- repository adapter behavior

---

## Presentation Layer

Presentation tests must validate UI behavior.

What to test:

- component rendering
- user interaction
- accessibility-critical behavior
- conditional rendering
- emitted events
- state transitions visible to the user

Rules:

- Test behavior from the user's perspective.
- Prefer Testing Library queries over implementation-driven selectors.
- Do not test private methods.
- Do not test Angular internals.
- Avoid brittle snapshot-heavy strategies.

---

# Test Types

## Unit Tests

Small tests for:

- pure functions
- domain services
- validators
- mappers
- use cases

They must be:

- fast
- isolated
- deterministic

## Component Tests

Component tests validate:

- rendering
- interaction
- input/output behavior
- visible state changes
- accessibility essentials

These should use Testing Library and mimic real user interaction.

## Integration Tests

Use these selectively for:

- feature slices with meaningful coordination
- adapters and use cases working together
- page-level interactions when valuable

Do not overuse them.

## E2E Tests

Deferred for later with Playwright.

Future scope:

- login flow
- match result registration
- standings display
- market workflow

---

# Tools

## Jest

Jest is the test runner and assertion framework.

Use it for:

- unit tests
- component tests
- mocks and spies when needed

Rules:

- Keep mocks minimal.
- Avoid global mocking unless justified.
- Reset state between tests.

## Testing Library

Testing Library is the default tool for UI testing.

Rules:

- Query the DOM the way a user perceives it.
- Prefer `getByRole`.
- Prefer `getByLabelText`.
- Prefer `getByText`.
- Avoid implementation-detail queries unless unavoidable.
- Prefer user-facing assertions.

Good:

- checking button labels
- checking visible error messages
- checking form accessibility
- checking interaction results

Bad:

- checking internal Angular component state directly
- asserting framework implementation details
- selecting by CSS classes unless there is no better option

## Playwright

Playwright will be introduced later for critical E2E coverage.

Not part of the mandatory test scope right now.

---

# File Naming

Test files should live close to the source they test whenever possible.

Examples:

```txt
player.entity.spec.ts
create-player.usecase.spec.ts
player-card.component.spec.ts
```

Rules:

- Keep tests near the code under test.
- Use .spec.ts consistently.
- One test file per unit when reasonable.

---

# Test Naming

Test names must describe behavior clearly.

Use behavior-driven descriptions.

Good examples:

```ts
it('should increase market value after a victory', () => {});
it('should reject a result when set scores are invalid', () => {});
it('should render the empty state when there are no players', () => {});
```

Bad examples:

```ts
it('works', () => {});
it('test player', () => {});
it('should call function', () => {});
```

Rules:

- Describe what the system should do.
- Avoid generic names.
- Make failures easy to understand.

---

# What to Mock

Mock only at architectural boundaries.

Good candidates for mocking:

- repository ports
- external clients
- HTTP adapters
- storage gateways
- browser APIs when needed

Do NOT mock:

- pure domain logic
- value objects
- simple mappers unless the boundary truly requires it

Rules:

- Mock dependencies, not the unit under test.
- Overmocking is a smell.
- If a test requires too much mocking, the design may be too coupled.

---

# What Not to Test

Do not waste time testing:

- framework internals
- trivial getters/setters
- implementation details with no behavioral value
- styling details unless they affect behavior or accessibility
- third-party library behavior

Focus on real behavior and real failure risks.

---

# Angular Component Testing Rules

Component tests must prioritize user-observable behavior.

Test:

- visible text
- rendered states
- button and input behavior
- emitted events
- validation feedback
- accessibility semantics where relevant

Avoid:

- inspecting internals unnecessarily
- asserting private signal values directly
- coupling tests to internal refactors

Prefer patterns like:

- render component
- interact as user
- assert visible outcome

---

# Forms Testing

Forms are critical and must be tested thoroughly.

Test:

- initial state
- validation states
- valid submission
- invalid submission
- error messages
- accessibility attributes

Rules:

- test real user interaction
- verify labels and roles
- verify disabled/enabled states where relevant

---

# Signals Testing

When testing code using signals:

- test the resulting behavior, not signal internals
- verify computed outcomes
- verify state transitions through public API or rendered result
- avoid coupling tests to internal implementation details

For pure stateful logic extracted from Angular components:

- prefer testing it as plain TypeScript when possible

---

# Accessibility in Tests

Accessibility must be validated in component tests where practical.

At minimum, test:

- buttons by role
- inputs by label
- dialogs by role
- error messages visible to users
- keyboard-relevant flows when important

Rules:

- prefer semantic queries
- inaccessible markup should be treated as a test failure signal

---

# Regression Testing

Every bug fix must include a regression test.

Workflow:

- reproduce the bug with a failing test
- implement the fix
- ensure the test stays green

Never fix a bug silently without protecting against recurrence.

---

# Refactoring and Tests

Tests must enable refactoring, not prevent it.

Rules:

- test behavior, not structure
- avoid brittle assertions
- keep test setup small
- extract test helpers when repetition is real
- do not create unreadable test abstractions

If tests are painful to maintain, the problem may be the production design.

---

# Test Quality Rules

Good tests are:

- focused
- readable
- deterministic
- fast
- behavior-oriented

Bad tests are:

- overly coupled to implementation
- fragile
- verbose for no reason
- dependent on execution order
- full of unnecessary mocks

---

# Coverage Philosophy

Coverage is a signal, not a goal by itself.

Rules:

- do not chase 100 percent blindly
- prioritize business-critical logic
- prioritize risky workflows
- prioritize areas that change often

High-value areas must have strong coverage:

- domain rules
- standings logic
- market value logic
- result registration
- permissions and role behavior

---

# Future E2E Strategy

When Playwright is added later, it should cover only the most critical user flows.

Expected future candidates:

- authentication flow
- create or edit match result
- standings page
- market actions
- role-based access flow

Do not move business validation responsibility to E2E.

---

# Output Expectations

When generating tests for this project:

- use Jest
- use Testing Library for UI tests
- follow TDD
- test behavior over implementation
- mock only at boundaries
- keep tests readable and small
- prioritize domain and use-case testing
- treat regression tests as mandatory for bug fixes
