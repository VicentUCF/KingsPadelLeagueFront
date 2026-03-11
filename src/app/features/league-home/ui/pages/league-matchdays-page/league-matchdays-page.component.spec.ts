import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueMatchdaysPageComponent } from './league-matchdays-page.component';

describe('LeagueMatchdaysPageComponent', () => {
  it('renders the matchday listing with cards and detail links', async () => {
    await render(LeagueMatchdaysPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Calendario por jornadas/i })).toBeVisible();
    expect(screen.getByText('Jornada 3')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornada 3/i })).toHaveAttribute(
      'href',
      '/jornadas/matchday-3',
    );
    expect(screen.getAllByText('En juego')).toHaveLength(2);
  });

  it('has no accessibility violations in the matchday listing snapshot', async () => {
    const { container } = await render(LeagueMatchdaysPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario por jornadas/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
