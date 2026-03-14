import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { TeamCardComponent } from './team-card.component';

describe('TeamCardComponent', () => {
  it('renders the team summary as a full card link', async () => {
    await render(TeamCardComponent, {
      inputs: {
        team: {
          id: 'house-navarro',
          slug: 'house-navarro',
          name: 'House Navarro',
          presidentName: 'Navarro',
          playerCountLabel: 'Jugadores: 6',
          monogram: 'HN',
          logoPath: '/teams_logos/Kings_of_Favar_no_bg.webp',
          palette: createPalette(),
          teamLink: '/equipos/house-navarro',
        },
      },
      providers: [provideRouter([])],
    });

    const link = screen.getByRole('link', { name: /House Navarro/i });

    expect(link).toHaveAttribute('href', '/equipos/house-navarro');
    expect(screen.getByText('Presidente: Navarro')).toBeVisible();
    expect(screen.getByText('Jugadores: 6')).toBeVisible();
  });
});

function createPalette() {
  return {
    primary: '#f3c84b',
    accent: '#f9e9a7',
    surface: '#24150b',
    glow: 'rgb(243 200 75 / 0.46)',
    contrast: '#0d0904',
  };
}
