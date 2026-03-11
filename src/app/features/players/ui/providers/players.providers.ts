import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { LoadPlayerProfileUseCase } from '@features/players/application/use-cases/load-player-profile.use-case';
import { LoadPlayersUseCase } from '@features/players/application/use-cases/load-players.use-case';
import { PlayersRepository } from '@features/players/application/ports/players.repository';
import { InMemoryPlayersRepository } from '@features/players/infrastructure/repositories/in-memory-players.repository';

export const LOAD_PLAYERS_USE_CASE = new InjectionToken<LoadPlayersUseCase>(
  'LOAD_PLAYERS_USE_CASE',
);

export const LOAD_PLAYER_PROFILE_USE_CASE = new InjectionToken<LoadPlayerProfileUseCase>(
  'LOAD_PLAYER_PROFILE_USE_CASE',
);

export function providePlayersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryPlayersRepository,
    {
      provide: PlayersRepository,
      useExisting: InMemoryPlayersRepository,
    },
    {
      provide: LOAD_PLAYERS_USE_CASE,
      useFactory: (playersRepository: PlayersRepository) =>
        new LoadPlayersUseCase(playersRepository),
      deps: [PlayersRepository],
    },
    {
      provide: LOAD_PLAYER_PROFILE_USE_CASE,
      useFactory: (playersRepository: PlayersRepository) =>
        new LoadPlayerProfileUseCase(playersRepository),
      deps: [PlayersRepository],
    },
  ]);
}
