import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueHomePageComponent } from './league-home-page.component';

describe('LeagueHomePageComponent', () => {
  it('renders the public league dashboard', async () => {
    await render(LeagueHomePageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /KingsPadelLeague/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Calendario oficial de jornadas/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Clasificación de la liga/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver equipos inscritos/i })).toHaveAttribute(
      'href',
      '/equipos',
    );
    expect(
      screen.getByRole('heading', { name: /Resultados oficiales de la jornada/i }),
    ).toBeVisible();
    expect(
      screen
        .getAllByRole('link', { name: /^Ver clasificación$/i })
        .some((link) => link.getAttribute('href') === '/clasificacion'),
    ).toBe(true);
    expect(screen.queryByText(/Descansa/i)).toBeNull();
    expect(
      screen.getByRole('table', { name: /Clasificación actual de KingsPadelLeague/i }),
    ).toBeVisible();
    expect(screen.getByRole('heading', { name: /Equipos participantes/i })).toBeVisible();
  });

  it('has no accessibility violations in the home snapshot', async () => {
    const { container } = await render(LeagueHomePageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /KingsPadelLeague/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
