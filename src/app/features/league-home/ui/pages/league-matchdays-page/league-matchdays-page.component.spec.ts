import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeatureTesting } from '../../testing/league-home-testing.providers';
import { LeagueMatchdaysPageComponent } from './league-matchdays-page.component';

describe('LeagueMatchdaysPageComponent', () => {
  it('renders the published matchdays listing', async () => {
    await render(LeagueMatchdaysPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', {
        name: /Calendario por jornadas/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver clasificación/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
    expect(screen.getByText(/5 jornadas publicadas/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornada 3/i })).toHaveAttribute(
      'href',
      '/jornadas/jornada-3',
    );
  });

  it('has no accessibility violations in the matchday listing snapshot', async () => {
    const { container } = await render(LeagueMatchdaysPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario por jornadas/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
