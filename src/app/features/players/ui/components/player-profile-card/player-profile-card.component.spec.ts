import { render, screen } from '@testing-library/angular';

import { PlayerProfileCardComponent } from './player-profile-card.component';

describe('PlayerProfileCardComponent', () => {
  it('renders a fallback icon when the player has no avatar yet', async () => {
    const { container } = await render(PlayerProfileCardComponent, {
      inputs: {
        player: {
          id: 'alex-soler',
          displayName: 'Alex Soler',
          teamName: 'Kings of Favar',
          teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
          teamMonogram: 'OF',
          teamPalette: {
            primary: '#f3c84b',
            accent: '#f9e9a7',
            surface: '#24150b',
            glow: 'rgb(243 200 75 / 0.46)',
            contrast: '#0d0904',
          },
          avatarPath: null,
          wonMatchesCount: 4,
          lostMatchesCount: 1,
          wonMatchesLabel: '4',
          lostMatchesLabel: '1',
          playedMatchesLabel: '5',
          winRate: 80,
          winRateLabel: '80%',
          overallRating: 88,
          side: 'derecha',
          sideLabel: 'Derecha',
          metaDescription: 'Perfil de Alex Soler',
          pageTitle: 'Alex Soler | Jugadores | KingsPadelLeague',
        },
      },
    });

    expect(screen.getByText('Alex Soler')).toBeVisible();
    expect(screen.queryByAltText('Alex Soler')).not.toBeInTheDocument();
    expect(container.querySelector('.player-profile-card__avatar-fallback')).not.toBeNull();
  });
});
