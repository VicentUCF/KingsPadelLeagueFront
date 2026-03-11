import { InjectionToken, makeEnvironmentProviders, type EnvironmentProviders } from '@angular/core';

import { BackofficeDashboardRepository } from '@features/backoffice/application/ports/backoffice-dashboard.repository';
import { LoadBackofficeDashboardSnapshotUseCase } from '@features/backoffice/application/use-cases/load-backoffice-dashboard-snapshot.use-case';
import { InMemoryBackofficeDashboardRepository } from '@features/backoffice/infrastructure/repositories/in-memory-backoffice-dashboard.repository';

export const LOAD_BACKOFFICE_DASHBOARD_SNAPSHOT_USE_CASE =
  new InjectionToken<LoadBackofficeDashboardSnapshotUseCase>(
    'LOAD_BACKOFFICE_DASHBOARD_SNAPSHOT_USE_CASE',
  );

export function provideBackofficeFeature(): EnvironmentProviders {
  return makeEnvironmentProviders([
    InMemoryBackofficeDashboardRepository,
    {
      provide: BackofficeDashboardRepository,
      useExisting: InMemoryBackofficeDashboardRepository,
    },
    {
      provide: LOAD_BACKOFFICE_DASHBOARD_SNAPSHOT_USE_CASE,
      useFactory: (backofficeDashboardRepository: BackofficeDashboardRepository) =>
        new LoadBackofficeDashboardSnapshotUseCase(backofficeDashboardRepository),
      deps: [BackofficeDashboardRepository],
    },
  ]);
}
