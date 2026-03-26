import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';
import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';

import {
  resolveBackofficeMatchdayCreationSeasonId,
  resolveCurrentBackofficeSeasonId,
} from './backoffice-season-resolution';

describe('backoffice-season-resolution', () => {
  const seasons: readonly BackofficeSeason[] = [
    {
      id: 'season-1',
      name: 'Temporada 2025',
      description: 'Primera',
      startsAt: '2025-01-01T00:00:00.000Z',
      endsAt: '2025-12-31T23:59:59.000Z',
    },
    {
      id: 'season-2',
      name: 'Temporada 2026',
      description: 'Actual',
      startsAt: '2026-01-01T00:00:00.000Z',
      endsAt: '2026-12-31T23:59:59.000Z',
    },
  ];

  it('prefers the in-progress matchday season for current resolution', () => {
    expect(
      resolveCurrentBackofficeSeasonId(seasons, [
        createMatchday({ seasonId: 'season-1', status: 'scheduled' }),
        createMatchday({ seasonId: 'season-2', status: 'in_progress' }),
      ]),
    ).toBe('season-2');
  });

  it('uses the scheduled matchday season for new matchday creation when there is no in-progress matchday', () => {
    expect(
      resolveBackofficeMatchdayCreationSeasonId(seasons, [
        createMatchday({ seasonId: 'season-1', status: 'finished' }),
        createMatchday({ seasonId: 'season-2', status: 'scheduled' }),
      ]),
    ).toBe('season-2');
  });

  it('falls back to the active season range when there are no scheduled or in-progress matchdays', () => {
    expect(
      resolveBackofficeMatchdayCreationSeasonId(seasons, [], new Date('2026-03-26T10:00:00.000Z')),
    ).toBe('season-2');
  });

  it('does not use the latest season fallback for new matchday creation', () => {
    expect(
      resolveBackofficeMatchdayCreationSeasonId(seasons, [], new Date('2027-03-26T10:00:00.000Z')),
    ).toBeNull();
  });

  it('keeps the latest season fallback for current season resolution', () => {
    expect(
      resolveCurrentBackofficeSeasonId(seasons, [], new Date('2027-03-26T10:00:00.000Z')),
    ).toBe('season-2');
  });
});

function createMatchday(overrides: Partial<BackofficeMatchday> = {}): BackofficeMatchday {
  return {
    id: 'matchday-1',
    name: 'Jornada 1',
    scheduledAt: '2026-03-26T18:00:00.000Z',
    seasonId: 'season-1',
    status: 'scheduled',
    ...overrides,
  };
}
