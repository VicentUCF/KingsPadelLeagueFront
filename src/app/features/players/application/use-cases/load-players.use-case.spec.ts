import { type Player } from '@features/players/domain/entities/player.entity';

import { PlayersRepository } from '../ports/players.repository';
import { LoadPlayersUseCase } from './load-players.use-case';

class PlayersRepositoryStub extends PlayersRepository {
  constructor(
    private readonly players: readonly Player[],
    private readonly playersBySlug: Record<string, Player> = {},
  ) {
    super();
  }

  override async findAll(): Promise<readonly Player[]> {
    return this.players;
  }

  override async findBySlug(slug: string): Promise<Player | null> {
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
});

function createPlayer(slug: string, displayName: string): Player {
  return {
    id: slug,
    slug,
    displayName,
    teamId: 'kings-of-favar',
    teamName: 'Kings of Favar',
    teamLogoPath: null,
    avatarPath: '/player-stock/avatar-01.svg',
    wonMatchesCount: 3,
    lostMatchesCount: 1,
    playedMatchesCount: 4,
    side: 'derecha',
  };
}
