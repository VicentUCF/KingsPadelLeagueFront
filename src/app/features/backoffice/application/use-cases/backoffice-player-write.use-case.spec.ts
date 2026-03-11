import {
  type BackofficePlayerDetail,
  type BackofficePlayerSummary,
} from '@features/backoffice/domain/entities/backoffice-player.entity';
import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';

import { ChangeBackofficePlayerStatusUseCase } from './change-backoffice-player-status.use-case';
import { CreateBackofficePlayerUseCase } from './create-backoffice-player.use-case';
import { UpdateBackofficePlayerUseCase } from './update-backoffice-player.use-case';

describe('backoffice player write use cases', () => {
  it('creates players through the repository contract', async () => {
    const repository = new BackofficePlayersRepositoryStub([
      createPlayerDetail('player-alex-soler', 'Alex Soler', 'ACTIVE'),
    ]);

    const useCase = new CreateBackofficePlayerUseCase(repository);
    const player = await useCase.execute({
      fullName: 'Marco Vidal',
      nickName: 'Marco',
      avatarPath: null,
      preferredSideLabel: 'Derecha',
      linkedUserEmail: 'marco@test.dev',
      status: 'ACTIVE',
      currentTeamId: 'titanics',
    });

    expect(player.fullName).toBe('Marco Vidal');
  });

  it('updates players through the repository contract', async () => {
    const repository = new BackofficePlayersRepositoryStub([
      createPlayerDetail('player-alex-soler', 'Alex Soler', 'ACTIVE'),
    ]);

    const useCase = new UpdateBackofficePlayerUseCase(repository);
    const player = await useCase.execute({
      id: 'player-alex-soler',
      fullName: 'Alex Soler',
      nickName: 'Alex',
      avatarPath: '/avatar.svg',
      preferredSideLabel: 'Revés',
      linkedUserEmail: null,
      status: 'INACTIVE',
      currentTeamId: null,
    });

    expect(player.status).toBe('INACTIVE');
  });

  it('allows quick deactivation only for active players', async () => {
    const repository = new BackofficePlayersRepositoryStub([
      createPlayerDetail('player-alex-soler', 'Alex Soler', 'ACTIVE'),
    ]);

    const useCase = new ChangeBackofficePlayerStatusUseCase(repository);
    const player = await useCase.execute({
      playerId: 'player-alex-soler',
      targetStatus: 'INACTIVE',
    });

    expect(player.status).toBe('INACTIVE');

    await expect(
      useCase.execute({
        playerId: 'player-alex-soler',
        targetStatus: 'INACTIVE',
      }),
    ).rejects.toThrow(/Solo puedes desactivar jugadores activos/i);
  });
});

class BackofficePlayersRepositoryStub extends BackofficePlayersRepository {
  constructor(private players: BackofficePlayerDetail[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficePlayerSummary[]> {
    return this.players;
  }

  override async findById(playerId: string): Promise<BackofficePlayerDetail | null> {
    return this.players.find((player) => player.id === playerId) ?? null;
  }

  override async create(command: {
    readonly fullName: string;
    readonly nickName: string;
    readonly status: BackofficePlayerDetail['status'];
  }): Promise<BackofficePlayerDetail> {
    const player = createPlayerDetail(
      `player-${command.fullName.toLocaleLowerCase('es').replaceAll(' ', '-')}`,
      command.fullName,
      command.status,
    );

    this.players = [...this.players, player];

    return player;
  }

  override async update(command: {
    readonly id: string;
    readonly fullName: string;
    readonly status: BackofficePlayerDetail['status'];
  }): Promise<BackofficePlayerDetail> {
    const player = createPlayerDetail(command.id, command.fullName, command.status);

    this.players = this.players.map((existingPlayer) =>
      existingPlayer.id === command.id ? player : existingPlayer,
    );

    return player;
  }

  override async changeStatus(command: {
    readonly playerId: string;
    readonly targetStatus: BackofficePlayerDetail['status'];
  }): Promise<BackofficePlayerDetail> {
    const currentPlayer = this.players.find((player) => player.id === command.playerId);

    if (!currentPlayer) {
      throw new Error('Not found');
    }

    const updatedPlayer = createPlayerDetail(
      currentPlayer.id,
      currentPlayer.fullName,
      command.targetStatus,
    );

    this.players = this.players.map((player) =>
      player.id === command.playerId ? updatedPlayer : player,
    );

    return updatedPlayer;
  }
}

function createPlayerDetail(
  id: string,
  fullName: string,
  status: BackofficePlayerDetail['status'],
): BackofficePlayerDetail {
  return {
    id,
    fullName,
    nickName: 'Alex',
    avatarPath: null,
    status,
    derivedCurrentTeamName: null,
    historicalTeamNames: [],
    isUserLinked: false,
    preferredSideLabel: 'Revés',
    linkedUserEmail: null,
    currentTeamId: null,
    historicalMemberships: [],
    participations: [],
    mvpNominations: [],
  };
}
