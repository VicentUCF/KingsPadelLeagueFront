import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import { ChangeBackofficeTeamStatusUseCase } from '@features/backoffice/application/use-cases/change-backoffice-team-status.use-case';
import { CreateBackofficeTeamUseCase } from '@features/backoffice/application/use-cases/create-backoffice-team.use-case';
import { FindActiveBackofficeSeasonUseCase } from '@features/backoffice/application/use-cases/find-active-backoffice-season.use-case';
import { LoadBackofficeTeamDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-team-detail.use-case';
import { LoadBackofficeTeamsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-teams.use-case';
import { UpdateBackofficeTeamUseCase } from '@features/backoffice/application/use-cases/update-backoffice-team.use-case';
import { InMemoryBackofficeSeasonsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-seasons.repository';
import { InMemoryBackofficeTeamsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-teams.repository';

export const LOAD_BACKOFFICE_TEAMS_USE_CASE = new InjectionToken<LoadBackofficeTeamsUseCase>(
  'LOAD_BACKOFFICE_TEAMS_USE_CASE',
);
export const LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficeTeamDetailUseCase>('LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE');
export const CREATE_BACKOFFICE_TEAM_USE_CASE = new InjectionToken<CreateBackofficeTeamUseCase>(
  'CREATE_BACKOFFICE_TEAM_USE_CASE',
);
export const UPDATE_BACKOFFICE_TEAM_USE_CASE = new InjectionToken<UpdateBackofficeTeamUseCase>(
  'UPDATE_BACKOFFICE_TEAM_USE_CASE',
);
export const CHANGE_BACKOFFICE_TEAM_STATUS_USE_CASE =
  new InjectionToken<ChangeBackofficeTeamStatusUseCase>('CHANGE_BACKOFFICE_TEAM_STATUS_USE_CASE');
export const FIND_ACTIVE_BACKOFFICE_SEASON_USE_CASE =
  new InjectionToken<FindActiveBackofficeSeasonUseCase>('FIND_ACTIVE_BACKOFFICE_SEASON_USE_CASE');

export function provideBackofficeTeamsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficeTeamsRepository,
    InMemoryBackofficeSeasonsRepository,
    {
      provide: BackofficeTeamsRepository,
      useExisting: InMemoryBackofficeTeamsRepository,
    },
    {
      provide: BackofficeSeasonsRepository,
      useExisting: InMemoryBackofficeSeasonsRepository,
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
    {
      provide: CREATE_BACKOFFICE_TEAM_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new CreateBackofficeTeamUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
    {
      provide: UPDATE_BACKOFFICE_TEAM_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new UpdateBackofficeTeamUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
    {
      provide: CHANGE_BACKOFFICE_TEAM_STATUS_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new ChangeBackofficeTeamStatusUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
    {
      provide: FIND_ACTIVE_BACKOFFICE_SEASON_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new FindActiveBackofficeSeasonUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
  ]);
}
