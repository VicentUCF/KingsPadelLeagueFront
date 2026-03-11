import { Player } from './player.entity';

describe('Player', () => {
  it('calculates played matches from won and lost matches', () => {
    const player = new Player(
      'player-1',
      'alex-soler',
      'Alex Soler',
      'kings-of-favar',
      'Kings of Favar',
      '/teams_logos/Kings_of_Favar_no_bg.png',
      '/player-stock/avatar-01.svg',
      4,
      2,
    );

    expect(player.wonMatchesCount).toBe(4);
    expect(player.lostMatchesCount).toBe(2);
    expect(player.playedMatchesCount).toBe(6);
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
        '/player-stock/avatar-02.svg',
        -1,
        2,
      );
    }).toThrow('Player match statistics cannot be negative.');
  });
});
