import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeatureTesting } from '../../testing/league-home-testing.providers';
import { LeagueStandingsPageComponent } from './league-standings-page.component';

describe('LeagueStandingsPageComponent', () => {
  it('renders the standings view with hero, table and quick actions', async () => {
    await render(LeagueStandingsPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /Clasificación oficial de la temporada 2026/i }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: /^Clasificación$/i })).toBeVisible();
    expect(screen.getByRole('table', { name: /Clasificación de KingsPadelLeague/i })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'JG' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'JP' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'DIF' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'PTS' })).toBeVisible();
    expect(screen.getByText(/Jornada 3 de 5/i)).toBeVisible();
    expect(screen.getByText(/Fase regular/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornadas/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver calendario/i })).toBeVisible();
  });

  it('has no accessibility violations in the standings snapshot', async () => {
    const { container } = await render(LeagueStandingsPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Clasificación oficial de la temporada 2026/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
