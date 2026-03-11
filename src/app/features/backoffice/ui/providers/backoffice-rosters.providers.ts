import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeRostersRepository } from '@features/backoffice/application/ports/backoffice-rosters.repository';
import { LoadBackofficeRosterDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-roster-detail.use-case';
import { LoadBackofficeRostersUseCase } from '@features/backoffice/application/use-cases/load-backoffice-rosters.use-case';
import { InMemoryBackofficeRostersRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-rosters.repository';

export const LOAD_BACKOFFICE_ROSTERS_USE_CASE = new InjectionToken<LoadBackofficeRostersUseCase>(
  'LOAD_BACKOFFICE_ROSTERS_USE_CASE',
);
export const LOAD_BACKOFFICE_ROSTER_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficeRosterDetailUseCase>('LOAD_BACKOFFICE_ROSTER_DETAIL_USE_CASE');

export function provideBackofficeRostersFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficeRostersRepository,
    {
      provide: BackofficeRostersRepository,
      useExisting: InMemoryBackofficeRostersRepository,
    },
    {
      provide: LOAD_BACKOFFICE_ROSTERS_USE_CASE,
      useFactory: (backofficeRostersRepository: BackofficeRostersRepository) =>
        new LoadBackofficeRostersUseCase(backofficeRostersRepository),
      deps: [BackofficeRostersRepository],
    },
    {
      provide: LOAD_BACKOFFICE_ROSTER_DETAIL_USE_CASE,
      useFactory: (backofficeRostersRepository: BackofficeRostersRepository) =>
        new LoadBackofficeRosterDetailUseCase(backofficeRostersRepository),
      deps: [BackofficeRostersRepository],
    },
  ]);
}
