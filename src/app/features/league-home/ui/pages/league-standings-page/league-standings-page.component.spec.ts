import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueStandingsPageComponent } from './league-standings-page.component';

describe('LeagueStandingsPageComponent', () => {
  it('renders the standings view with hero, table and tiebreaks', async () => {
    await render(LeagueStandingsPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /KingsPadelLeague — Temporada 1/i }),
    ).toBeVisible();
    expect(screen.getByRole('table', { name: /Clasificación de KingsPadelLeague/i })).toBeVisible();
    expect(screen.getByText(/Desempates/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornadas/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver calendario/i })).toBeVisible();
  });

  it('has no accessibility violations in the standings snapshot', async () => {
    const { container } = await render(LeagueStandingsPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /KingsPadelLeague — Temporada 1/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
