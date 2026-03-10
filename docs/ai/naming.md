This document defines the naming conventions for the frontend.

Clear naming is one of the most important aspects of maintainable software.

Good names make code:

- easier to read
- easier to understand
- easier to refactor
- easier to maintain

Names must reflect **domain meaning and intent**, not implementation details.

---

# General Naming Principles

All names should follow these principles:

- intention revealing
- domain oriented
- concise but clear
- consistent across the codebase

Names should answer:

- what is this?
- what does it do?
- why does it exist?

Avoid names that require reading the entire file to understand their purpose.

---

# Avoid Generic Names

The following names are discouraged unless truly justified:

- data
- item
- object
- thing
- helper
- manager
- handler
- utils
- misc
- common
- service

These names hide meaning.

Prefer specific names that describe **responsibility and context**.

Bad:

```ts
dataService
helper
manager
```

Better:

```ts
playerRepository
matchResultValidator
marketValueCalculator
```

## Domain Naming

Domain code must reflect real domain language.

Examples for this project:

Good names:

- Player
- Team
- Match
- Standings
- MarketValue
- MatchResult

Avoid technical naming in the domain layer.

Bad:

- PlayerModel
- PlayerData
- PlayerEntityDTO

Domain objects should represent real concepts.

## Use Case Naming

Use cases must be named as actions.

Format:

- Verb + DomainConcept

Examples:

- CreatePlayerUseCase
- UpdateMarketValueUseCase
- RegisterMatchResultUseCase
- LoadStandingsUseCase

Rules:

- names should describe a single action
- avoid vague names like PlayerService

Bad:

- PlayerService
- PlayersManager
- HandlePlayers

## Repository Naming

Repositories represent data access capabilities.

Format:

- `<Entity>Repository`

Examples:

- PlayerRepository
- TeamRepository
- MatchRepository

Infrastructure implementations should reflect the technology used.

Examples:

- SupabasePlayerRepository
- HttpPlayerRepository

Rules:

- repositories represent capabilities, not storage details
- ports should not include infrastructure names

## Component Naming

Angular components must describe UI intent.

Format:

- Feature + UI Concept

Examples:

- PlayersPageComponent
- PlayerCardComponent
- MatchResultFormComponent
- StandingsTableComponent

Rules:

- avoid generic names like CardComponent
- components should reflect the UI role

## Page Naming

Page components represent route-level views.

Format:

- Feature + Page

Examples:

- PlayersPageComponent
- TeamsPageComponent
- StandingsPageComponent
- MarketPageComponent

Folder example:

```txt
players-page/
  players-page.component.ts
```

## Presentational Component Naming

Presentational components represent UI pieces.

Examples:

- PlayerCardComponent
- TeamBadgeComponent
- MatchScoreComponent
- StandingsRowComponent

Rules:

- names should describe the visual element rendered

## Service Naming

Services must reflect clear responsibilities.

Examples:

- PlayersStateService
- MarketStateService
- StandingsService

Avoid:

- HelperService
- UtilityService
- CommonService

If a service name is vague, the responsibility is probably unclear.

## State Naming

State signals should be named clearly and consistently.

Examples:

- players
- selectedPlayerId
- isLoading
- error

Derived state:

- selectedPlayer
- playerCount

Rules:

- use descriptive names
- avoid abbreviations unless extremely common

Bad:

- pl
- selId
- cnt

## Variable Naming

Variables should describe their content.

Examples:

Good:

- players
- teams
- matchResults
- selectedPlayer
- currentRound

Bad:

- data
- items
- list
- result
- tmp

Rules:

- avoid meaningless abbreviations
- avoid single-letter variables except in very small scopes

## Boolean Naming

Booleans must read naturally in conditions.

Format:

- isX
- hasX
- canX
- shouldX

Examples:

- isLoading
- hasError
- canEditMatch
- shouldShowStandings

Avoid ambiguous names.

Bad:

- flag
- status
- active

## File Naming

All files must use kebab-case.

Examples:

- player-card.component.ts
- match-result-form.component.ts
- players-page.component.ts
- market-value.service.ts
- player.mapper.ts

Rules:

- avoid camelCase in filenames
- avoid inconsistent naming styles

## Folder Naming

Folders must also use kebab-case.

Examples:

- player-card/
- players-page/
- match-result-form/
- market-value/

Rules:

- folder names must reflect the feature or component they contain

## DTO Naming

DTOs represent external data contracts.

Format:

- `<Entity>Dto`

Examples:

- PlayerDto
- MatchDto
- TeamDto

Rules:

- DTOs must stay in the infrastructure layer
- domain entities must not depend on DTOs

## Mapper Naming

Mappers convert data between layers.

Format:

- `<Entity>Mapper`

Examples:

- PlayerMapper
- MatchMapper
- StandingsMapper

Responsibilities:

- DTO → Domain
- Domain → ViewModel

## ViewModel Naming

View models represent UI-friendly structures.

Format:

- `<Entity>ViewModel`

Examples:

- PlayerViewModel
- TeamViewModel
- MatchViewModel

Rules:

- view models belong to the presentation layer

## Test Naming

Test files must mirror the unit being tested.

Examples:

- player.entity.spec.ts
- create-player.usecase.spec.ts
- player-card.component.spec.ts

Test descriptions should describe behavior.

Example:

```ts
it('should increase market value after a victory', () => {});
```

Avoid vague names:

```ts
it('works')
it('test player')
```

## Enum Naming

Enums should describe a domain concept.

Example:

- UserRole
- MatchStatus
- MarketState

Enum values should be uppercase.

Example:

- ADMIN
- PRESIDENT
- PLAYER

## Constants Naming

Constants must use uppercase with underscores.

Example:

- MAX_PLAYERS_PER_TEAM
- DEFAULT_MARKET_VALUE
- STANDINGS_POINTS_WIN

## Naming Consistency

Consistency is critical.

If a concept is called:

- player

Do not later call it:

- participant
- member
- athlete

Consistency reduces cognitive load.

## Renaming Rules

Rename aggressively when names become misleading.

Common triggers:

- responsibilities changed
- domain terminology improved
- refactoring introduced better abstraction

Renaming is a cheap improvement with high long-term impact.

## Naming Anti-Patterns

Avoid:

- vague names
- abbreviations that hide meaning
- inconsistent naming styles
- technical jargon in domain names
- implementation details in names
- overly long names

Examples of bad names:

- playerDataManagerService
- doPlayerThing
- handleStuff

## Output Expectations

When generating code:

- use clear domain language
- avoid vague names
- follow Angular naming conventions
- keep naming consistent across features
- prefer clarity over brevity
