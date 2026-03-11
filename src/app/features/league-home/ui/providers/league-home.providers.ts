import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import { LoadLeagueMatchdaysUseCase } from '@features/league-home/application/use-cases/load-league-matchdays.use-case';
import { LoadLeagueHomeSnapshotUseCase } from '@features/league-home/application/use-cases/load-league-home-snapshot.use-case';
import { InMemoryLeagueHomeRepository } from '@features/league-home/infrastructure/repositories/in-memory-league-home.repository';

export const LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE = new InjectionToken<LoadLeagueHomeSnapshotUseCase>(
  'LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE',
);
export const LOAD_LEAGUE_MATCHDAYS_USE_CASE = new InjectionToken<LoadLeagueMatchdaysUseCase>(
  'LOAD_LEAGUE_MATCHDAYS_USE_CASE',
);

export function provideLeagueHomeFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryLeagueHomeRepository,
    {
      provide: LeagueHomeRepository,
      useExisting: InMemoryLeagueHomeRepository,
    },
    {
      provide: LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE,
      useFactory: (leagueHomeRepository: LeagueHomeRepository) =>
        new LoadLeagueHomeSnapshotUseCase(leagueHomeRepository),
      deps: [LeagueHomeRepository],
    },
    {
      provide: LOAD_LEAGUE_MATCHDAYS_USE_CASE,
      useFactory: (leagueHomeRepository: LeagueHomeRepository) =>
        new LoadLeagueMatchdaysUseCase(leagueHomeRepository),
      deps: [LeagueHomeRepository],
    },
  ]);
}
