# Backoffice Tasks

## Context

- Functional source: `docs/ai/backend.md`
- Current scope: internal backoffice without real login.
- Goal: build an operational tool, not a public CRUD site.
- Initial development will use typed mocks, in-memory adapters and simulated role guards.

## Initial Decisions

- The backoffice will live under `src/app/features/backoffice/`.
- Entry point will be a lazy route under `/backoffice`.
- The backoffice will have its own shell with sidebar, topbar and breadcrumbs.
- Roles will be simulated in frontend for now: `ADMIN`, `PRESIDENT`, `USER`.
- Final API contracts will not be assumed yet. We will work with provisional DTOs and mappers.
- Sensitive actions must require explicit confirmation in UI.
- Derived data must be shown as read-only: standings, fixture points, winners, MVP score breakdowns.

## Implementation Guardrails

- Respect feature-first hexagonal architecture in every backoffice module.
- Keep domain rules outside Angular components.
- Use standalone components, signals and lazy loaded routes.
- Write tests first when a screen includes real rules or state transitions.
- Keep reusable UI in `shared/` only when it is genuinely feature-agnostic.
- Surface important states and restrictions in the UI instead of hiding them.

## Out Of Scope For Now

- Real authentication and final authorization policies.
- Definitive API contracts.
- Direct Supabase coupling.
- Deep business rules implemented only in the client.

## Execution Backlog

### Phase 0. Foundation

- [ ] Create the `backoffice` feature root and lazy route.
- [ ] Create a dedicated backoffice shell with sidebar, topbar and breadcrumbs.
- [ ] Add simulated session state with role switching for local development.
- [ ] Define backoffice navigation from the roadmap modules.
- [ ] Create reusable backoffice primitives: status badge, role badge, confirmation modal, entity header.
- [ ] Add initial test coverage for shell rendering, navigation and role-based visibility.

Exit criteria:
Backoffice route works end-to-end, navigation is stable and the app can render different role states without real auth.

### Phase 1. Priority 1

- [ ] Dashboard page with operational summary cards and quick actions.
- [ ] Seasons module: list, detail and create/edit draft flow with mocks.
- [ ] Teams module: list, detail and structural tabs.
- [ ] Players module: list and detail.
- [ ] Provisional DTOs and in-memory repositories for dashboard, seasons, teams and players.
- [ ] Shared table/form patterns needed by these modules.

Exit criteria:
The backoffice supports the first operational read flows and admin CRUD scaffolding with typed mock data.

### Phase 2. Priority 2

- [ ] Roster module: active memberships view.
- [ ] Roster change requests list and decision flow.
- [ ] Guest approval requests list and decision flow.
- [ ] Matchdays module: list and detail.
- [ ] Fixtures module: list and detail shell with tabs.
- [ ] UI state rules for request statuses and visible restrictions.

Exit criteria:
Roster and competition operations are navigable and the fixture becomes the central operational entry point.

### Phase 3. Priority 3

- [ ] Lineup management with pair editor and client validations.
- [ ] Result entry flow for pair matches and fixture closure.
- [ ] Sanctions module with apply and revert flows.
- [ ] Confirmation patterns for sensitive operations.
- [ ] Tests for lineup rules, result forms and sanctions visibility.

Exit criteria:
The main operational workflows can be exercised in UI with realistic state transitions and safe confirmations.

### Phase 4. Priority 4

- [ ] MVP module: election overview, nominations, votes and result breakdown.
- [ ] Users and roles module.
- [ ] Audit module placeholder with navigation and initial design.
- [ ] Activity timeline or audit item component.

Exit criteria:
The backoffice covers the full roadmap skeleton and the remaining integration work is mostly backend connection.

## Cross-Cutting Rules To Preserve

- Only one active season can exist.
- A lineup must contain exactly 4 unique players and 2 pairs.
- A guest is limited to 1 per team and fixture.
- Guests are not allowed in playoff and are not eligible for MVP.
- `Pair One` awards 3 points and `Pair Two` awards 2 points.
- Standings and awarded points are derived, never manually editable.
- Invalid actions must not be shown for the current role or state.

## Recommended First Slice

- [ ] Add `/backoffice` lazy route.
- [ ] Build the backoffice shell and module navigation.
- [ ] Add simulated role switching for `ADMIN` and `PRESIDENT`.
- [ ] Render a dashboard placeholder fed by in-memory data.
- [ ] Leave menu entries for all roadmap modules, even if some routes start as placeholders.

Expected outcome:
We get a stable backbone for the backoffice and can start implementing modules incrementally without revisiting navigation or layout.
