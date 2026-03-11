import { Player } from '@features/players/domain/entities/player.entity';

import {
  toPlayerDirectorySectionsViewModel,
  toRankedPlayersViewModel,
} from './player-directory.viewmodel';

describe('toPlayerDirectorySectionsViewModel', () => {
  it('groups players by team while preserving the roster order', () => {
    const result = toPlayerDirectorySectionsViewModel([
      createPlayer('alex-soler', 'Alex Soler', 'kings-of-favar', 'Kings of Favar', 4, 1),
      createPlayer('bruno-sanz', 'Bruno Sanz', 'kings-of-favar', 'Kings of Favar', 3, 2),
      createPlayer('sergio-torres', 'Sergio Torres', 'titanics', 'Titanics', 2, 1),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({
      teamId: 'kings-of-favar',
      teamName: 'Kings of Favar',
      playerCountLabel: 'Jugadores: 2',
    });
    expect(result[0]?.players.map((player) => player.profileLink)).toEqual([
      '/jugadores/alex-soler',
      '/jugadores/bruno-sanz',
    ]);
    expect(result[1]).toMatchObject({
      teamId: 'titanics',
      teamName: 'Titanics',
      playerCountLabel: 'Jugadores: 1',
    });
  });

  it('maps statistic labels for each card', () => {
    const [section] = toPlayerDirectorySectionsViewModel([
      createPlayer('diego-ferrer', 'Diego Ferrer', 'kings-of-favar', 'Kings of Favar', 2, 3),
    ]);

    expect(section?.players[0]).toMatchObject({
      wonMatchesLabel: '2',
      lostMatchesLabel: '3',
      playedMatchesCount: 5,
    });
  });

  it('sorts tied players alphabetically when no competitive stats exist yet', () => {
    const result = toRankedPlayersViewModel([
      createPlayer('zeta-player', 'Zeta Player', 'kings-of-favar', 'Kings of Favar', 0, 0),
      createPlayer('alfa-player', 'Alfa Player', 'kings-of-favar', 'Kings of Favar', 0, 0),
      createPlayer('beta-player', 'Beta Player', 'titanics', 'Titanics', 0, 0),
    ]);

    expect(result.map((player) => player.displayName)).toEqual([
      'Alfa Player',
      'Beta Player',
      'Zeta Player',
    ]);
  });
});

function createPlayer(
  slug: string,
  displayName: string,
  teamId: string,
  teamName: string,
  wonMatchesCount: number,
  lostMatchesCount: number,
): Player {
  return new Player(
    slug,
    slug,
    displayName,
    teamId,
    teamName,
    null,
    null,
    wonMatchesCount,
    lostMatchesCount,
  );
}
