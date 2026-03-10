import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { ScheduledMatchesRepository } from '@features/matches/application/ports/scheduled-matches.repository';
import { LoadUpcomingMatchesUseCase } from '@features/matches/application/use-cases/load-upcoming-matches.use-case';
import { InMemoryScheduledMatchesRepository } from '@features/matches/infrastructure/repositories/in-memory-scheduled-matches.repository';

export const LOAD_UPCOMING_MATCHES_USE_CASE = new InjectionToken<LoadUpcomingMatchesUseCase>(
  'LOAD_UPCOMING_MATCHES_USE_CASE',
);

export function provideUpcomingMatchesFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryScheduledMatchesRepository,
    {
      provide: ScheduledMatchesRepository,
      useExisting: InMemoryScheduledMatchesRepository,
    },
    {
      provide: LOAD_UPCOMING_MATCHES_USE_CASE,
      useFactory: (scheduledMatchesRepository: ScheduledMatchesRepository) =>
        new LoadUpcomingMatchesUseCase(scheduledMatchesRepository),
      deps: [ScheduledMatchesRepository],
    },
  ]);
}
