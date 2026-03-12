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
        null,
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

  it('describes pending team assignment when the player is not attached to a squad yet', () => {
    const viewModel = toPlayerProfileViewModel(
      new Player(
        'alex-pla',
        'alex-pla',
        'Alex Pla',
        'pending-team-assignment',
        'Sin equipo todavía',
        null,
        null,
        0,
        0,
      ),
    );

    expect(viewModel.teamName).toBe('Sin equipo todavía');
    expect(viewModel.metaDescription).toContain('todavía no tiene equipo asignado');
  });
});
