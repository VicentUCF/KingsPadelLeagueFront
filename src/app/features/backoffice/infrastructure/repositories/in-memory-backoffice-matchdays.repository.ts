import { Injectable } from '@angular/core';

import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';

const MOCK_MATCHDAYS: readonly BackofficeMatchday[] = [
  {
    id: 'jornada-1',
    name: 'Jornada 1',
    scheduledAt: '2026-03-01T17:00:00.000Z',
    seasonId: 'season-2026',
    status: 'finished',
  },
  {
    id: 'jornada-2',
    name: 'Jornada 2',
    scheduledAt: '2026-03-08T17:00:00.000Z',
    seasonId: 'season-2026',
    status: 'finished',
  },
  {
    id: 'jornada-3',
    name: 'Jornada 3',
    scheduledAt: '2026-03-15T17:00:00.000Z',
    seasonId: 'season-2026',
    status: 'in_progress',
  },
  {
    id: 'jornada-4',
    name: 'Jornada 4',
    scheduledAt: '2026-03-22T17:00:00.000Z',
    seasonId: 'season-2026',
    status: 'scheduled',
  },
  {
    id: 'jornada-5',
    name: 'Jornada 5',
    scheduledAt: '2026-03-29T17:00:00.000Z',
    seasonId: 'season-2026',
    status: 'scheduled',
  },
];

@Injectable()
export class InMemoryBackofficeMatchdaysRepository extends BackofficeMatchdaysRepository {
  override loadAll(): Promise<readonly BackofficeMatchday[]> {
    return Promise.resolve(MOCK_MATCHDAYS);
  }
}
