import { type Player } from '@features/players/domain/entities/player.entity';

import { PlayersRepository } from '../ports/players.repository';
import { LoadPlayerProfileUseCase } from './load-player-profile.use-case';

class PlayersRepositoryStub extends PlayersRepository {
  readonly findBySlugCalls: { readonly slug: string; readonly forceRefresh: boolean }[] = [];

  constructor(
    private readonly players: readonly Player[],
    private readonly playersBySlug: Record<string, Player> = {},
  ) {
    super();
  }

  override async findAll(_forceRefresh = false): Promise<readonly Player[]> {
    return this.players;
  }

  override async findBySlug(slug: string, forceRefresh = false): Promise<Player | null> {
    this.findBySlugCalls.push({ slug, forceRefresh });

    return this.playersBySlug[slug] ?? null;
  }
}

describe('LoadPlayerProfileUseCase', () => {
  it('returns null when the player slug does not exist', async () => {
    const useCase = new LoadPlayerProfileUseCase(new PlayersRepositoryStub([]));

    await expect(useCase.execute('missing-player')).resolves.toBeNull();
  });

  it('returns the requested player profile', async () => {
    const player = createPlayer('alex-soler', 'Alex Soler');
    const useCase = new LoadPlayerProfileUseCase(
      new PlayersRepositoryStub([], {
        'alex-soler': player,
      }),
    );

    await expect(useCase.execute('alex-soler')).resolves.toBe(player);
  });

  it('passes forceRefresh to the repository', async () => {
    const repository = new PlayersRepositoryStub([]);
    const useCase = new LoadPlayerProfileUseCase(repository);

    await useCase.execute('alex-soler', true);

    expect(repository.findBySlugCalls).toEqual([{ slug: 'alex-soler', forceRefresh: true }]);
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
    wonMatchesCount: 3,
    lostMatchesCount: 1,
    playedMatchesCount: 4,
    side: 'derecha',
  };
}
