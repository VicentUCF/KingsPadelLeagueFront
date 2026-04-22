import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { PlayerCardComponent } from './player-card.component';

describe('PlayerCardComponent', () => {
  it('renders the player as a ranking row link', async () => {
    await render(PlayerCardComponent, {
      providers: [provideRouter([])],
      inputs: {
        player: {
          id: 'alex-soler',
          displayName: 'Alex Soler',
          teamName: 'Kings of Favar',
          teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.webp',
          avatarPath: '/players/alex-soler.webp',
          wonMatchesCount: 4,
          lostMatchesCount: 1,
          playedMatchesCount: 5,
          wonMatchesLabel: '4',
          lostMatchesLabel: '1',
          profileLink: '/jugadores/alex-soler',
          ranking: 1,
          totalPoints: 12,
          totalPointsLabel: 'PTS 12',
          winRate: 80,
          winRateLabel: '80%',
          side: 'derecha',
          sideLabel: 'Derecha',
        },
      },
    });

    const link = screen.getByRole('link', { name: /Alex Soler/i });

    expect(link).toHaveAttribute('href', '/jugadores/alex-soler');
    expect(screen.getByText('Kings of Favar')).toBeVisible();
    expect(screen.getByText('12')).toBeVisible();
    expect(
      screen.getByText('Puntos de temporada', { selector: '.u-visually-hidden' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Ganados', { selector: '.u-visually-hidden' })).toBeInTheDocument();
    expect(screen.getByText('Perdidos', { selector: '.u-visually-hidden' })).toBeInTheDocument();
  });

  it('renders a fallback icon when the player has no avatar yet', async () => {
    const { container } = await render(PlayerCardComponent, {
      providers: [provideRouter([])],
      inputs: {
        player: {
          id: 'alex-soler',
          displayName: 'Alex Soler',
          teamName: 'Kings of Favar',
          teamLogoPath: null,
          avatarPath: null,
          wonMatchesCount: 4,
          lostMatchesCount: 1,
          playedMatchesCount: 5,
          wonMatchesLabel: '4',
          lostMatchesLabel: '1',
          profileLink: '/jugadores/alex-soler',
          ranking: 1,
          totalPoints: 0,
          totalPointsLabel: 'PTS 0',
          winRate: 80,
          winRateLabel: '80%',
          side: 'derecha',
          sideLabel: 'Derecha',
        },
      },
    });

    expect(screen.getByRole('link', { name: /Alex Soler/i })).toBeVisible();
    expect(screen.queryByAltText('Alex Soler')).not.toBeInTheDocument();
    expect(container.querySelector('.player-card__avatar-fallback')).not.toBeNull();
  });
});
