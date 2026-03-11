import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';
import { ChangeBackofficePlayerStatusUseCase } from '@features/backoffice/application/use-cases/change-backoffice-player-status.use-case';
import { CreateBackofficePlayerUseCase } from '@features/backoffice/application/use-cases/create-backoffice-player.use-case';
import { LoadBackofficePlayerDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-player-detail.use-case';
import { LoadBackofficePlayersUseCase } from '@features/backoffice/application/use-cases/load-backoffice-players.use-case';
import { LoadBackofficeTeamsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-teams.use-case';
import { UpdateBackofficePlayerUseCase } from '@features/backoffice/application/use-cases/update-backoffice-player.use-case';
import { InMemoryBackofficePlayersRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-players.repository';
import { InMemoryBackofficeTeamsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-teams.repository';

export const LOAD_BACKOFFICE_PLAYERS_USE_CASE = new InjectionToken<LoadBackofficePlayersUseCase>(
  'LOAD_BACKOFFICE_PLAYERS_USE_CASE',
);
export const LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficePlayerDetailUseCase>('LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE');
export const CREATE_BACKOFFICE_PLAYER_USE_CASE = new InjectionToken<CreateBackofficePlayerUseCase>(
  'CREATE_BACKOFFICE_PLAYER_USE_CASE',
);
export const UPDATE_BACKOFFICE_PLAYER_USE_CASE = new InjectionToken<UpdateBackofficePlayerUseCase>(
  'UPDATE_BACKOFFICE_PLAYER_USE_CASE',
);
export const CHANGE_BACKOFFICE_PLAYER_STATUS_USE_CASE =
  new InjectionToken<ChangeBackofficePlayerStatusUseCase>(
    'CHANGE_BACKOFFICE_PLAYER_STATUS_USE_CASE',
  );
export const LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE = new InjectionToken<LoadBackofficeTeamsUseCase>(
  'LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE',
);

export function provideBackofficePlayersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficePlayersRepository,
    InMemoryBackofficeTeamsRepository,
    {
      provide: BackofficePlayersRepository,
      useExisting: InMemoryBackofficePlayersRepository,
    },
    {
      provide: BackofficeTeamsRepository,
      useExisting: InMemoryBackofficeTeamsRepository,
    },
    {
      provide: LOAD_BACKOFFICE_PLAYERS_USE_CASE,
      useFactory: (backofficePlayersRepository: BackofficePlayersRepository) =>
        new LoadBackofficePlayersUseCase(backofficePlayersRepository),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE,
      useFactory: (backofficePlayersRepository: BackofficePlayersRepository) =>
        new LoadBackofficePlayerDetailUseCase(backofficePlayersRepository),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: CREATE_BACKOFFICE_PLAYER_USE_CASE,
      useFactory: (backofficePlayersRepository: BackofficePlayersRepository) =>
        new CreateBackofficePlayerUseCase(backofficePlayersRepository),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: UPDATE_BACKOFFICE_PLAYER_USE_CASE,
      useFactory: (backofficePlayersRepository: BackofficePlayersRepository) =>
        new UpdateBackofficePlayerUseCase(backofficePlayersRepository),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: CHANGE_BACKOFFICE_PLAYER_STATUS_USE_CASE,
      useFactory: (backofficePlayersRepository: BackofficePlayersRepository) =>
        new ChangeBackofficePlayerStatusUseCase(backofficePlayersRepository),
      deps: [BackofficePlayersRepository],
    },
    {
      provide: LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE,
      useFactory: (backofficeTeamsRepository: BackofficeTeamsRepository) =>
        new LoadBackofficeTeamsUseCase(backofficeTeamsRepository),
      deps: [BackofficeTeamsRepository],
    },
  ]);
}
