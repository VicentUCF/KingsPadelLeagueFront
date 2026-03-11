import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import { LoadBackofficePlayerDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-player-detail.use-case';
import { LoadBackofficePlayersUseCase } from '@features/backoffice/application/use-cases/load-backoffice-players.use-case';
import { InMemoryBackofficePlayersRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-players.repository';

export const LOAD_BACKOFFICE_PLAYERS_USE_CASE = new InjectionToken<LoadBackofficePlayersUseCase>(
  'LOAD_BACKOFFICE_PLAYERS_USE_CASE',
);
export const LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficePlayerDetailUseCase>('LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE');

export function provideBackofficePlayersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficePlayersRepository,
    {
      provide: BackofficePlayersRepository,
      useExisting: InMemoryBackofficePlayersRepository,
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
  ]);
}
