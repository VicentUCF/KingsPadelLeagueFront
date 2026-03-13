import { Injectable } from '@angular/core';

import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';

const MOCK_SEASONS: readonly BackofficeSeason[] = [
  {
    id: 'season-2026',
    name: 'Temporada 2026',
    description: 'Primera temporada oficial de Kings Padel League.',
    startsAt: '2026-03-01T00:00:00.000Z',
    endsAt: '2026-03-29T23:59:59.000Z',
  },
];

@Injectable()
export class InMemoryBackofficeSeasonsRepository extends BackofficeSeasonsRepository {
  override loadAll(): Promise<readonly BackofficeSeason[]> {
    return Promise.resolve(MOCK_SEASONS);
  }
}
