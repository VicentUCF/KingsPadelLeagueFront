import { Player } from './player.entity';

describe('Player', () => {
  it('calculates played matches from won and lost matches', () => {
    const player = new Player(
      'player-1',
      'alex-soler',
      'Alex Soler',
      'kings-of-favar',
      'Kings of Favar',
      '/teams_logos/Kings_of_Favar_no_bg.webp',
      null,
      4,
      2,
      'ambas',
      9,
    );

    expect(player.wonMatchesCount).toBe(4);
    expect(player.lostMatchesCount).toBe(2);
    expect(player.playedMatchesCount).toBe(6);
    expect(player.totalPoints).toBe(9);
  });

  it('rejects negative statistics', () => {
    expect(() => {
      return new Player(
        'player-2',
        'bruno-sanz',
        'Bruno Sanz',
        'barbaridad',
        'Barbaridad',
        null,
        null,
        -1,
        2,
      );
    }).toThrow('Player match statistics cannot be negative.');
  });

  it('rejects negative total points', () => {
    expect(() => {
      return new Player(
        'player-3',
        'vicent-ciscar',
        'Vicent Ciscar',
        'kings-of-favar',
        'Kings of Favar',
        null,
        null,
        1,
        0,
        'ambas',
        -1,
      );
    }).toThrow('Player season points cannot be negative.');
  });
});
