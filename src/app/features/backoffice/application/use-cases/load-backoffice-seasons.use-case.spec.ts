import { type BackofficeSeasonSummary } from '@features/backoffice/domain/entities/backoffice-season.entity';

import { BackofficeSeasonsRepository } from '../ports/backoffice-seasons.repository';
import { LoadBackofficeSeasonsUseCase } from './load-backoffice-seasons.use-case';

class BackofficeSeasonsRepositoryStub extends BackofficeSeasonsRepository {
  constructor(private readonly seasons: readonly BackofficeSeasonSummary[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficeSeasonSummary[]> {
    return this.seasons;
  }

  override async findById(): Promise<null> {
    return null;
  }
}

describe('LoadBackofficeSeasonsUseCase', () => {
  it('sorts seasons by operational priority and year', async () => {
    const useCase = new LoadBackofficeSeasonsUseCase(
      new BackofficeSeasonsRepositoryStub([
        createSeasonSummary('season-2024', 'Temporada 2024', 2024, 'ARCHIVED'),
        createSeasonSummary('season-2027', 'Temporada 2027', 2027, 'DRAFT'),
        createSeasonSummary('season-2025', 'Temporada 2025', 2025, 'FINISHED'),
        createSeasonSummary('season-2026', 'Temporada 2026', 2026, 'ACTIVE'),
      ]),
    );

    await expect(useCase.execute()).resolves.toEqual([
      createSeasonSummary('season-2026', 'Temporada 2026', 2026, 'ACTIVE'),
      createSeasonSummary('season-2027', 'Temporada 2027', 2027, 'DRAFT'),
      createSeasonSummary('season-2025', 'Temporada 2025', 2025, 'FINISHED'),
      createSeasonSummary('season-2024', 'Temporada 2024', 2024, 'ARCHIVED'),
    ]);
  });
});

function createSeasonSummary(
  id: string,
  name: string,
  year: number,
  status: BackofficeSeasonSummary['status'],
): BackofficeSeasonSummary {
  return {
    id,
    name,
    year,
    status,
    scheduleLabel: `${year}-01-01 / ${year}-06-01`,
    teamCount: 5,
    matchdayCount: 7,
  };
}
