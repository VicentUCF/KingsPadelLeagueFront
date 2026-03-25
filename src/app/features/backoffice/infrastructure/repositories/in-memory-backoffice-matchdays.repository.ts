import { Injectable } from '@angular/core';

import {
  BackofficeMatchdaysRepository,
  type CreateBackofficeMatchdayInput,
} from '@features/backoffice/application/ports/backoffice-matchdays.repository';
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
  private matchdays: readonly BackofficeMatchday[] = MOCK_MATCHDAYS;

  override loadAll(): Promise<readonly BackofficeMatchday[]> {
    return Promise.resolve(this.matchdays);
  }

  override create(input: CreateBackofficeMatchdayInput): Promise<BackofficeMatchday> {
    const matchday: BackofficeMatchday = {
      id: `matchday-${this.matchdays.length + 1}`,
      ...input,
      status: 'scheduled',
    };
    this.matchdays = [...this.matchdays, matchday];
    return Promise.resolve(matchday);
  }

  override start(matchdayId: string): Promise<void> {
    this.matchdays = this.matchdays.map((matchday) =>
      matchday.id === matchdayId ? { ...matchday, status: 'in_progress' } : matchday,
    );
    return Promise.resolve();
  }

  override finish(matchdayId: string): Promise<void> {
    this.matchdays = this.matchdays.map((matchday) =>
      matchday.id === matchdayId ? { ...matchday, status: 'finished' } : matchday,
    );
    return Promise.resolve();
  }

  override createPairMatches(_matchdayId: string): Promise<void> {
    return Promise.resolve();
  }
}
