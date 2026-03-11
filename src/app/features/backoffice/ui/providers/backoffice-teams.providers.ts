import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import { LoadBackofficeTeamDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-team-detail.use-case';
import { LoadBackofficeTeamsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-teams.use-case';
import { InMemoryBackofficeTeamsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-teams.repository';

export const LOAD_BACKOFFICE_TEAMS_USE_CASE = new InjectionToken<LoadBackofficeTeamsUseCase>(
  'LOAD_BACKOFFICE_TEAMS_USE_CASE',
);
export const LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficeTeamDetailUseCase>('LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE');

export function provideBackofficeTeamsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficeTeamsRepository,
    {
      provide: BackofficeTeamsRepository,
      useExisting: InMemoryBackofficeTeamsRepository,
    },
    {
      provide: LOAD_BACKOFFICE_TEAMS_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new LoadBackofficeTeamsUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
    {
      provide: LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new LoadBackofficeTeamDetailUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
  ]);
}
