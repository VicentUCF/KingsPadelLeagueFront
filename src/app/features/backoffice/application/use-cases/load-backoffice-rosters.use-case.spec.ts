import { type BackofficeRosterSummary } from '@features/backoffice/domain/entities/backoffice-roster.entity';

import { BackofficeRostersRepository } from '../ports/backoffice-rosters.repository';
import { LoadBackofficeRostersUseCase } from './load-backoffice-rosters.use-case';

class BackofficeRostersRepositoryStub extends BackofficeRostersRepository {
  constructor(private readonly rosters: readonly BackofficeRosterSummary[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficeRosterSummary[]> {
    return this.rosters;
  }

  override async findById(): Promise<null> {
    return null;
  }
}

describe('LoadBackofficeRostersUseCase', () => {
  it('sorts rosters in review first and then by team name', async () => {
    const useCase = new LoadBackofficeRostersUseCase(
      new BackofficeRostersRepositoryStub([
        createRosterSummary('titanics', 'Titanics', 'HEALTHY'),
        createRosterSummary('barbaridad', 'Barbaridad', 'REVIEW'),
        createRosterSummary('legacy-team', 'Legacy Team', 'CLOSED'),
        createRosterSummary('kings-of-favar', 'Kings of Favar', 'REVIEW'),
      ]),
    );

    await expect(useCase.execute()).resolves.toEqual([
      createRosterSummary('barbaridad', 'Barbaridad', 'REVIEW'),
      createRosterSummary('kings-of-favar', 'Kings of Favar', 'REVIEW'),
      createRosterSummary('titanics', 'Titanics', 'HEALTHY'),
      createRosterSummary('legacy-team', 'Legacy Team', 'CLOSED'),
    ]);
  });
});

function createRosterSummary(
  id: string,
  teamName: string,
  status: BackofficeRosterSummary['status'],
): BackofficeRosterSummary {
  return {
    id,
    teamId: id,
    teamName,
    teamShortName: teamName.slice(0, 3).toUpperCase(),
    seasonLabel: 'Temporada 2026',
    primaryColor: '#111111',
    secondaryColor: '#c9a227',
    status,
    regularSlotsUsed: 6,
    regularSlotsLimit: 6,
    activeGuestCount: 0,
    pendingRequestsCount: status === 'REVIEW' ? 1 : 0,
    validityLabel: '3 marzo · 28 junio',
  };
}
