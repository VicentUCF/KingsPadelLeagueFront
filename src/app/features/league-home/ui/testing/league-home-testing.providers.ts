import type { Provider } from '@angular/core';

import { LoadLeagueMatchdaysUseCase } from '@features/league-home/application/use-cases/load-league-matchdays.use-case';
import { LoadLeagueHomeSnapshotUseCase } from '@features/league-home/application/use-cases/load-league-home-snapshot.use-case';
import { InMemoryLeagueHomeRepository } from '@features/league-home/infrastructure/repositories/in-memory-league-home.repository';
import {
  LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE,
  LOAD_LEAGUE_MATCHDAYS_USE_CASE,
} from '../providers/league-home.providers';

export function provideLeagueHomeFeatureTesting(): Provider[] {
  return [
    InMemoryLeagueHomeRepository,
    {
      provide: LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE,
      useFactory: (leagueHomeRepository: InMemoryLeagueHomeRepository) =>
        new LoadLeagueHomeSnapshotUseCase(leagueHomeRepository),
      deps: [InMemoryLeagueHomeRepository],
    },
    {
      provide: LOAD_LEAGUE_MATCHDAYS_USE_CASE,
      useFactory: (leagueHomeRepository: InMemoryLeagueHomeRepository) =>
        new LoadLeagueMatchdaysUseCase(leagueHomeRepository),
      deps: [InMemoryLeagueHomeRepository],
    },
  ];
}
