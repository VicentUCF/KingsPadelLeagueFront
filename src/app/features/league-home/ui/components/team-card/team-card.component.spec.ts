import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { TeamCardComponent } from './team-card.component';

describe('TeamCardComponent', () => {
  it('renders the team summary as a full card link', async () => {
    await render(TeamCardComponent, {
      inputs: {
        team: {
          id: 'house-navarro',
          name: 'House Navarro',
          presidentName: 'Navarro',
          playerCountLabel: 'Jugadores: 6',
          monogram: 'HN',
          logoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
          teamLink: '/equipos',
        },
      },
      providers: [provideRouter([])],
    });

    const link = screen.getByRole('link', { name: /House Navarro/i });

    expect(link).toHaveAttribute('href', '/equipos');
    expect(screen.getByText('Presidente: Navarro')).toBeVisible();
    expect(screen.getByText('Jugadores: 6')).toBeVisible();
  });
});
