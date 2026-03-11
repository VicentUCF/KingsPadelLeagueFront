import { Player } from '@features/players/domain/entities/player.entity';

import { toPlayerProfileViewModel } from './player-profile.viewmodel';

describe('toPlayerProfileViewModel', () => {
  it('builds labels and metadata for a player profile', () => {
    const viewModel = toPlayerProfileViewModel(
      new Player(
        'alex-soler',
        'alex-soler',
        'Alex Soler',
        'kings-of-favar',
        'Kings of Favar',
        '/teams_logos/Kings_of_Favar_no_bg.png',
        '/player-stock/avatar-01.svg',
        4,
        1,
      ),
    );

    expect(viewModel).toMatchObject({
      displayName: 'Alex Soler',
      teamName: 'Kings of Favar',
      teamMonogram: 'OF',
      wonMatchesLabel: '4',
      lostMatchesLabel: '1',
      pageTitle: 'Alex Soler | Jugadores | KingsPadelLeague',
    });
    expect(viewModel.teamPalette).toMatchObject({
      primary: '#f3c84b',
      surface: '#24150b',
    });
    expect(viewModel.metaDescription).toContain('Alex Soler');
    expect(viewModel.metaDescription).toContain('Kings of Favar');
  });
});
