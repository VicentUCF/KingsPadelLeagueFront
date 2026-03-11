import { type BackofficeTeamSummary } from '@features/backoffice/domain/entities/backoffice-team.entity';

import { BackofficeTeamsRepository } from '../ports/backoffice-teams.repository';
import { LoadBackofficeTeamsUseCase } from './load-backoffice-teams.use-case';

class BackofficeTeamsRepositoryStub extends BackofficeTeamsRepository {
  constructor(private readonly teams: readonly BackofficeTeamSummary[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficeTeamSummary[]> {
    return this.teams;
  }

  override async findById(): Promise<null> {
    return null;
  }
}

describe('LoadBackofficeTeamsUseCase', () => {
  it('sorts active teams before inactive and archived ones', async () => {
    const useCase = new LoadBackofficeTeamsUseCase(
      new BackofficeTeamsRepositoryStub([
        createTeamSummary('magic-city', 'Magic City', 'ACTIVE'),
        createTeamSummary('barbaridad', 'Barbaridad', 'ACTIVE'),
        createTeamSummary('legacy-team', 'Legacy Team', 'ARCHIVED'),
        createTeamSummary('house-perez', 'House Perez', 'INACTIVE'),
      ]),
    );

    await expect(useCase.execute()).resolves.toEqual([
      createTeamSummary('barbaridad', 'Barbaridad', 'ACTIVE'),
      createTeamSummary('magic-city', 'Magic City', 'ACTIVE'),
      createTeamSummary('house-perez', 'House Perez', 'INACTIVE'),
      createTeamSummary('legacy-team', 'Legacy Team', 'ARCHIVED'),
    ]);
  });
});

function createTeamSummary(
  id: string,
  name: string,
  status: BackofficeTeamSummary['status'],
): BackofficeTeamSummary {
  return {
    id,
    name,
    shortName: name.slice(0, 3).toUpperCase(),
    primaryColor: '#111111',
    secondaryColor: '#c9a227',
    presidentName: 'Presidente',
    activeRegularPlayersCount: 6,
    status,
    seasonLabel: 'Temporada 2026',
  };
}
