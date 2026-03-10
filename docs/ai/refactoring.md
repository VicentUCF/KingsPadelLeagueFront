This document defines the refactoring standards for the frontend.

Refactoring is a mandatory part of development.

It is not an optional cleanup task and it must not be postponed indefinitely.

The goal of refactoring is to keep the codebase:

- readable
- maintainable
- testable
- scalable
- easy to change

All refactoring decisions should follow pragmatic principles inspired by:

https://refactoring.guru/

---

# Refactoring Philosophy

Refactoring means improving the internal structure of the code **without changing its external behavior**.

Rules:

- Refactor continuously.
- Do not wait for a "cleanup phase".
- Leave the code better than you found it.
- Refactor in small safe steps.
- Keep tests green before, during, and after refactoring.
- If code is hard to read, it is already a refactoring candidate.

---

# Mandatory Refactoring Workflow

For any non-trivial change, follow this sequence:

1. understand the current behavior
2. protect behavior with tests
3. make the change
4. refactor
5. confirm tests still pass

Refactoring without tests is risky.  
Feature work without refactoring is how projects rot.

---

# What Should Trigger Refactoring

Refactor when you detect:

- duplicated logic
- long methods
- large files
- bloated components
- bloated services
- deeply nested conditionals
- vague naming
- too many responsibilities in one unit
- repeated template fragments
- repeated styling patterns
- excessive signal/effect complexity
- hard-to-test logic
- cross-layer leakage
- primitive obsession
- shotgun surgery risk
- feature envy
- data clumps

If a change feels harder than it should be, the design is already warning you.

---

# Main Refactoring Principles

## Small Safe Steps

Refactor incrementally.

Do not rewrite large areas without control.

Prefer:

- extract
- rename
- move
- simplify
- isolate

Avoid large uncontrolled rewrites.

---

## Behavior Preservation

Refactoring must not alter intended behavior.

Rules:

- tests must protect the current behavior
- visual or API changes are not refactoring
- internal cleanup must remain externally safe

---

## Readability First

Code is written for people first.

Prefer:

- clear naming
- short methods
- explicit flow
- obvious responsibilities

Avoid:

- clever abstractions
- compressed logic
- dense condition chains
- misleading generic names

---

# Core Refactorings to Apply

## Extract Method

Use when:

- a method does too many things
- logic blocks are hard to scan
- a method contains multiple levels of abstraction

Bad:

```ts
savePlayer(): void {
  // validate form
  // map dto
  // call service
  // update UI state
  // handle error
}
```

Better:

```ts
savePlayer(): void {
  if (!this.isFormValid()) {
    return;
  }

  const command = this.buildCommand();
  this.executeSave(command);
}
```

Rules:

- methods should express intent
- low-level details should be extracted

## Extract Class

Use when:

- a component or service has too many responsibilities
- state handling, mapping, and domain logic are mixed together
- a file becomes hard to scan

Examples:

- extract mapper
- extract validator
- extract state service
- extract presenter
- extract use case

## Remove Duplication

Duplication is one of the main sources of decay.

Refactor repeated:

- logic
- validation rules
- mapping code
- template structures
- styling patterns

Rules:

- do not copy-paste and "fix later"
- extract only when duplication is real
- avoid premature abstractions from one single use case

## Replace Magic Numbers and Strings

Do not leave unexplained constants in code.

Bad:

```ts
if (score > 3) {
}
```

Better:

```ts
const WIN_THRESHOLD = 3;

if (score > WIN_THRESHOLD) {
}
```

Apply this to:

- status values
- limits
- breakpoints
- business thresholds
- storage keys
- route fragments where appropriate

## Simplify Conditionals

Refactor conditionals when they become hard to understand.

Use:

- guard clauses
- named boolean expressions
- extracted predicates
- better domain modeling

Bad:

```ts
if (user && user.role && user.role === 'admin' && marketOpen && !isClosed) {
}
```

Better:

```ts
if (!this.canManageMarket(user)) {
  return;
}
```

Or better still, move that rule to a dedicated policy or use case.

## Replace Primitive Obsession

When domain concepts are repeatedly represented as raw strings, numbers, or booleans, consider stronger modeling.

Examples:

Instead of:

```ts
type Role = string;
```

Prefer:

```ts
type UserRole = 'ADMIN' | 'PRESIDENT' | 'PLAYER';
```

Or dedicated value objects where useful.

Use stronger modeling when it improves correctness and readability.

## Move Logic to the Right Layer

Refactor misplaced logic aggressively.

Move:

- business rules out of components
- API mapping out of templates
- infrastructure concerns out of presentation
- orchestration out of domain entities
- reusable validation out of pages

This is one of the highest-value refactorings in the project.

---

# Angular Refactoring Rules

## Refactor Large Components

Split components when they contain too much:

- UI state
- form logic
- mapping
- conditional rendering
- repeated UI blocks

Extract into:

- child components
- state services
- mappers
- validators
- use cases

## Refactor Large Templates

Templates must remain simple.

Refactor when:

- conditionals become deeply nested
- repeated markup appears
- the template becomes difficult to scan
- rendering logic starts expressing business rules

Possible actions:

- extract presentational components
- extract view models
- simplify state preparation in TS

## Refactor Signal Complexity

Signals can become messy if unmanaged.

Refactor when:

- too many signals exist in one file
- effects start encoding logic
- computed chains become hard to follow
- state duplicates derived values

Possible actions:

- extract feature state service
- replace duplicated state with computed
- move logic into use cases

---

# Styling Refactoring Rules

Refactor styles when:

- selectors become deeply nested
- specificity increases
- styles are duplicated
- files become too large
- layout and component concerns are mixed

Possible actions:

- extract object
- extract utility
- simplify BEM structure
- split component styles

See `styling.md` for styling-specific rules.

---

# File Size Triggers

These are practical warning thresholds, not rigid laws.

Recommended limits:

- component class: under 200 lines
- template: under 150 lines
- service: under 200 lines
- domain entity: under 150 lines
- SCSS file: under 200 lines

If a file exceeds these limits and feels hard to scan, refactor it.

---

# Code Smells to Watch

Common smells that require action:

- long method
- large class
- duplicated code
- divergent change
- shotgun surgery
- primitive obsession
- data clumps
- feature envy
- temporary fields
- message chains
- middle man with no value
- speculative generality

Do not memorize the labels for show.
Use them to identify design problems early.

---

# Refactoring and TDD

TDD and refactoring are inseparable.

Rules:

- red → green → refactor
- do not stop at green
- every bug fix should end with cleaner code if possible
- refactor only under test protection

If code cannot be safely refactored, that is usually a testing problem.

---

# Refactoring and Architecture

Refactoring must protect architectural boundaries.

Refactor whenever you see:

- domain leaking into presentation
- infrastructure leaking into UI
- direct backend model usage in templates
- shared folder abuse
- feature coupling

Architecture erosion must be corrected early, not tolerated.

---

# Naming Refactoring

Rename aggressively when names are unclear.

Bad names:

- data
- item
- thing
- helper
- manager
- utils
- service without a clear responsibility

Good names describe:

- purpose
- responsibility
- domain meaning

See `naming.md` for naming rules.

---

# What Not to Do

Do not:

- postpone obvious refactors forever
- hide poor design behind comments
- create abstractions with no current need
- split code into too many pieces without real gain
- rewrite everything when a small refactor is enough
- refactor without tests for behavior that matters

---

# Refactoring Output Expectations

When generating or modifying code:

- improve structure when needed
- extract duplicated logic
- keep files small
- keep methods short
- improve naming
- preserve behavior
- respect architecture boundaries
- use tests as protection
- prefer incremental cleanup over large rewrites
