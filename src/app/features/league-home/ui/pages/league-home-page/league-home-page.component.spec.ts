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
    expect(screen.getByRole('heading', { name: /Próxima jornada/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Clasificación actual/i })).toBeVisible();
    expect(screen.getByText('Jornada 3 · Descansa')).toBeVisible();
    expect(screen.getByRole('table', { name: /Clasificación actual/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Equipos de la liga/i })).toBeVisible();
  });

  it('has no accessibility violations in the home snapshot', async () => {
    const { container } = await render(LeagueHomePageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /KingsPadelLeague/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
