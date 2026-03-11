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
          teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
          avatarPath: '/player-stock/avatar-01.svg',
          wonMatchesCount: 4,
          lostMatchesCount: 1,
          playedMatchesCount: 5,
          wonMatchesLabel: '4',
          lostMatchesLabel: '1',
          profileLink: '/jugadores/alex-soler',
          ranking: 1,
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
    expect(screen.getByText('Ganados', { selector: '.u-visually-hidden' })).toBeInTheDocument();
    expect(screen.getByText('Perdidos', { selector: '.u-visually-hidden' })).toBeInTheDocument();
  });
});
