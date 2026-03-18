import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeatureTesting } from '../../testing/league-home-testing.providers';
import { LeagueHomePageComponent } from './league-home-page.component';

describe('LeagueHomePageComponent', () => {
  it('renders the public league dashboard', async () => {
    await render(LeagueHomePageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /KingsPadelLeague/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Próxima jornada/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Clasificación de la liga/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Últimos resultados/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver clasificación completa/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
    expect(screen.getByText(/Jornada 3 · Descansa/i)).toBeVisible();
    expect(
      screen.getByRole('table', { name: /Clasificación actual de KingsPadelLeague/i }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: /Equipos participantes/i })).toBeVisible();
  });

  it('has no accessibility violations in the home snapshot', async () => {
    const { container } = await render(LeagueHomePageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /KingsPadelLeague/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
