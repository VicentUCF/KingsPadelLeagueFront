import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import { BACKOFFICE_MATCHES_REPOSITORY } from '@features/backoffice/application/ports/backoffice-matches.repository';
import { BACKOFFICE_LINEUPS_REPOSITORY } from '@features/backoffice/application/ports/backoffice-lineups.repository';
import { BACKOFFICE_AUDIT_REPOSITORY } from '@features/backoffice/application/ports/backoffice-audit.repository';
import { LoadBackofficeMatchdaysUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matchdays.use-case';
import { LoadBackofficePlayersUseCase } from '@features/backoffice/application/use-cases/load-backoffice-players.use-case';
import { LoadBackofficeSeasonsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-seasons.use-case';
import { LoadBackofficeTeamsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-teams.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeAuditUseCase } from '@features/backoffice/application/use-cases/load-backoffice-audit.use-case';
import { HttpBackofficeTeamsRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-teams.repository';
import { HttpBackofficePlayersRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-players.repository';
import { HttpBackofficeSeasonsRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-seasons.repository';
import { HttpBackofficeMatchdaysRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-matchdays.repository';
import { HttpBackofficeMatchesRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-matches.repository';
import { HttpBackofficeLineupsRepository } from '@features/backoffice/infrastructure/repositories/http-backoffice-lineups.repository';
import { BackofficeMatchdaysStore } from '../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../state/backoffice-players.store';
import { BackofficeSeasonsStore } from '../state/backoffice-seasons.store';
import { BackofficeSessionStore } from '../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../state/backoffice-teams.store';
import { BackofficeLineupsStore } from '../state/backoffice-lineups.store';
import { BackofficeStandingsStore } from '../state/backoffice-standings.store';
import { BackofficeAuditStore } from '../state/backoffice-audit.store';

export const LOAD_BACKOFFICE_TEAMS_USE_CASE = new InjectionToken<LoadBackofficeTeamsUseCase>(
  'LOAD_BACKOFFICE_TEAMS_USE_CASE',
);
export const LOAD_BACKOFFICE_PLAYERS_USE_CASE = new InjectionToken<LoadBackofficePlayersUseCase>(
  'LOAD_BACKOFFICE_PLAYERS_USE_CASE',
);
export const LOAD_BACKOFFICE_SEASONS_USE_CASE = new InjectionToken<LoadBackofficeSeasonsUseCase>(
  'LOAD_BACKOFFICE_SEASONS_USE_CASE',
);
export const LOAD_BACKOFFICE_MATCHDAYS_USE_CASE =
  new InjectionToken<LoadBackofficeMatchdaysUseCase>('LOAD_BACKOFFICE_MATCHDAYS_USE_CASE');

export function provideBackofficeFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    // ── Repositories ──────────────────────────────────────────────────────────
    HttpBackofficeTeamsRepository,
    { provide: BackofficeTeamsRepository, useExisting: HttpBackofficeTeamsRepository },
    HttpBackofficePlayersRepository,
    { provide: BackofficePlayersRepository, useExisting: HttpBackofficePlayersRepository },
    HttpBackofficeSeasonsRepository,
    { provide: BackofficeSeasonsRepository, useExisting: HttpBackofficeSeasonsRepository },
    HttpBackofficeMatchdaysRepository,
    { provide: BackofficeMatchdaysRepository, useExisting: HttpBackofficeMatchdaysRepository },
    HttpBackofficeMatchesRepository,
    { provide: BACKOFFICE_MATCHES_REPOSITORY, useExisting: HttpBackofficeMatchesRepository },
    HttpBackofficeLineupsRepository,
    { provide: BACKOFFICE_LINEUPS_REPOSITORY, useExisting: HttpBackofficeLineupsRepository },
    { provide: BACKOFFICE_AUDIT_REPOSITORY, useValue: { loadAll: () => Promise.resolve([]) } },

    // ── Use cases ─────────────────────────────────────────────────────────────
    {
      provide: LOAD_BACKOFFICE_TEAMS_USE_CASE,
      useFactory: (repo: BackofficeTeamsRepository) => new LoadBackofficeTeamsUseCase(repo),
      deps: [BackofficeTeamsRepository],
    },
    {
      provide: LOAD_BACKOFFICE_PLAYERS_USE_CASE,
      useFactory: (repo: BackofficePlayersRepository) => new LoadBackofficePlayersUseCase(repo),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: LOAD_BACKOFFICE_SEASONS_USE_CASE,
      useFactory: (repo: BackofficeSeasonsRepository) => new LoadBackofficeSeasonsUseCase(repo),
      deps: [BackofficeSeasonsRepository],
    },
    {
      provide: LOAD_BACKOFFICE_MATCHDAYS_USE_CASE,
      useFactory: (repo: BackofficeMatchdaysRepository) => new LoadBackofficeMatchdaysUseCase(repo),
      deps: [BackofficeMatchdaysRepository],
    },
    LoadBackofficeMatchesUseCase,
    LoadBackofficeLineupsUseCase,
    LoadBackofficeAuditUseCase,

    // ── Stores ────────────────────────────────────────────────────────────────
    BackofficeSessionStore,
    BackofficeTeamsStore,
    BackofficePlayersStore,
    BackofficeSeasonsStore,
    BackofficeMatchdaysStore,
    BackofficeLineupsStore,
    BackofficeStandingsStore,
    BackofficeAuditStore,
  ]);
}
