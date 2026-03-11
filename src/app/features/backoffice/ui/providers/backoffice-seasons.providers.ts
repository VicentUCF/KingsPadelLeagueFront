import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import { ChangeBackofficeSeasonStatusUseCase } from '@features/backoffice/application/use-cases/change-backoffice-season-status.use-case';
import { CreateBackofficeSeasonUseCase } from '@features/backoffice/application/use-cases/create-backoffice-season.use-case';
import { LoadBackofficeSeasonDetailUseCase } from '@features/backoffice/application/use-cases/load-backoffice-season-detail.use-case';
import { LoadBackofficeSeasonsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-seasons.use-case';
import { UpdateBackofficeSeasonUseCase } from '@features/backoffice/application/use-cases/update-backoffice-season.use-case';
import { InMemoryBackofficeSeasonsRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-seasons.repository';

export const LOAD_BACKOFFICE_SEASONS_USE_CASE = new InjectionToken<LoadBackofficeSeasonsUseCase>(
  'LOAD_BACKOFFICE_SEASONS_USE_CASE',
);

export const LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE =
  new InjectionToken<LoadBackofficeSeasonDetailUseCase>('LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE');
export const CREATE_BACKOFFICE_SEASON_USE_CASE = new InjectionToken<CreateBackofficeSeasonUseCase>(
  'CREATE_BACKOFFICE_SEASON_USE_CASE',
);
export const UPDATE_BACKOFFICE_SEASON_USE_CASE = new InjectionToken<UpdateBackofficeSeasonUseCase>(
  'UPDATE_BACKOFFICE_SEASON_USE_CASE',
);
export const CHANGE_BACKOFFICE_SEASON_STATUS_USE_CASE =
  new InjectionToken<ChangeBackofficeSeasonStatusUseCase>(
    'CHANGE_BACKOFFICE_SEASON_STATUS_USE_CASE',
  );

export function provideBackofficeSeasonsFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficeSeasonsRepository,
    {
      provide: BackofficeSeasonsRepository,
      useExisting: InMemoryBackofficeSeasonsRepository,
    },
    {
      provide: LOAD_BACKOFFICE_SEASONS_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new LoadBackofficeSeasonsUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
    {
      provide: LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new LoadBackofficeSeasonDetailUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
    {
      provide: CREATE_BACKOFFICE_SEASON_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new CreateBackofficeSeasonUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
    {
      provide: UPDATE_BACKOFFICE_SEASON_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new UpdateBackofficeSeasonUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
    {
      provide: CHANGE_BACKOFFICE_SEASON_STATUS_USE_CASE,
      useFactory: (backofficeSeasonsRepository: BackofficeSeasonsRepository) =>
        new ChangeBackofficeSeasonStatusUseCase(backofficeSeasonsRepository),
      deps: [BackofficeSeasonsRepository],
    },
  ]);
}
