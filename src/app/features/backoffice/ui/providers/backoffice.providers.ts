import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import { LoadBackofficeMatchdaysUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matchdays.use-case';
import { LoadBackofficePlayersUseCase } from '@features/backoffice/application/use-cases/load-backoffice-players.use-case';
import { LoadBackofficeSeasonsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-seasons.use-case';
import { LoadBackofficeTeamsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-teams.use-case';
import { InMemoryBackofficeMatchdaysRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-matchdays.repository';
import { InMemoryBackofficePlayersRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-players.repository';
import { InMemoryBackofficeSeasonsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-seasons.repository';
import { InMemoryBackofficeTeamsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-teams.repository';
import { BackofficeMatchdaysStore } from '../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../state/backoffice-players.store';
import { BackofficeSeasonsStore } from '../state/backoffice-seasons.store';
import { BackofficeSessionStore } from '../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../state/backoffice-teams.store';

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
    InMemoryBackofficeTeamsRepository,
    { provide: BackofficeTeamsRepository, useExisting: InMemoryBackofficeTeamsRepository },
    InMemoryBackofficePlayersRepository,
    { provide: BackofficePlayersRepository, useExisting: InMemoryBackofficePlayersRepository },
    InMemoryBackofficeSeasonsRepository,
    { provide: BackofficeSeasonsRepository, useExisting: InMemoryBackofficeSeasonsRepository },
    InMemoryBackofficeMatchdaysRepository,
    { provide: BackofficeMatchdaysRepository, useExisting: InMemoryBackofficeMatchdaysRepository },

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

    // ── Stores ────────────────────────────────────────────────────────────────
    BackofficeSessionStore,
    BackofficeTeamsStore,
    BackofficePlayersStore,
    BackofficeSeasonsStore,
    BackofficeMatchdaysStore,
  ]);
}
