import { type BackofficePlayerSummary } from '@features/backoffice/domain/entities/backoffice-player.entity';

import { BackofficePlayersRepository } from '../ports/backoffice-players.repository';
import { LoadBackofficePlayersUseCase } from './load-backoffice-players.use-case';

class BackofficePlayersRepositoryStub extends BackofficePlayersRepository {
  constructor(private readonly players: readonly BackofficePlayerSummary[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficePlayerSummary[]> {
    return this.players;
  }

  override async findById(): Promise<null> {
    return null;
  }
}

describe('LoadBackofficePlayersUseCase', () => {
  it('sorts active players first and then by display name', async () => {
    const useCase = new LoadBackofficePlayersUseCase(
      new BackofficePlayersRepositoryStub([
        createPlayerSummary('p3', 'Zeta Ruiz', 'ACTIVE'),
        createPlayerSummary('p1', 'Alex Soler', 'ACTIVE'),
        createPlayerSummary('p2', 'Bruno Costa', 'INACTIVE'),
      ]),
    );

    await expect(useCase.execute()).resolves.toEqual([
      createPlayerSummary('p1', 'Alex Soler', 'ACTIVE'),
      createPlayerSummary('p3', 'Zeta Ruiz', 'ACTIVE'),
      createPlayerSummary('p2', 'Bruno Costa', 'INACTIVE'),
    ]);
  });
});

function createPlayerSummary(
  id: string,
  fullName: string,
  status: BackofficePlayerSummary['status'],
): BackofficePlayerSummary {
  return {
    id,
    fullName,
    nickName: fullName.split(' ')[0] ?? fullName,
    avatarPath: null,
    status,
    derivedCurrentTeamName: 'Titanics',
    historicalTeamNames: ['Titanics'],
    isUserLinked: true,
  };
}
