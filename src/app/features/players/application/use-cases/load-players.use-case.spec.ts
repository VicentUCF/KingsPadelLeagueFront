import { type Player } from '@features/players/domain/entities/player.entity';

import { PlayersRepository } from '../ports/players.repository';
import { LoadPlayersUseCase } from './load-players.use-case';

class PlayersRepositoryStub extends PlayersRepository {
  readonly findAllCalls: boolean[] = [];

  constructor(
    private readonly players: readonly Player[],
    private readonly playersBySlug: Record<string, Player> = {},
  ) {
    super();
  }

  override async findAll(forceRefresh = false): Promise<readonly Player[]> {
    this.findAllCalls.push(forceRefresh);

    return this.players;
  }

  override async findBySlug(slug: string, _forceRefresh = false): Promise<Player | null> {
    return this.playersBySlug[slug] ?? null;
  }
}

describe('LoadPlayersUseCase', () => {
  it('returns the full players roster', async () => {
    const players = [
      createPlayer('alex-soler', 'Alex Soler'),
      createPlayer('bruno-sanz', 'Bruno Sanz'),
    ];
    const useCase = new LoadPlayersUseCase(new PlayersRepositoryStub(players));

    const result = await useCase.execute();

    expect(result.map((player) => player.slug)).toEqual(['alex-soler', 'bruno-sanz']);
  });

  it('passes forceRefresh to the repository', async () => {
    const repository = new PlayersRepositoryStub([createPlayer('alex-soler', 'Alex Soler')]);
    const useCase = new LoadPlayersUseCase(repository);

    await useCase.execute(true);

    expect(repository.findAllCalls).toEqual([true]);
  });
});

function createPlayer(slug: string, displayName: string): Player {
  return {
    id: slug,
    slug,
    displayName,
    teamId: 'kings-of-favar',
    teamName: 'Kings of Favar',
    teamLogoPath: null,
    avatarPath: null,
    totalPoints: 9,
    wonMatchesCount: 3,
    lostMatchesCount: 1,
    playedMatchesCount: 4,
    side: 'derecha',
  };
}
