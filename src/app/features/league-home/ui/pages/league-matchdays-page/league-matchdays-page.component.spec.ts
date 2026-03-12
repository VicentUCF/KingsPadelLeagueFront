import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueMatchdaysPageComponent } from './league-matchdays-page.component';

describe('LeagueMatchdaysPageComponent', () => {
  it('shows an empty state when there are no published matchdays', async () => {
    await render(LeagueMatchdaysPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', {
        name: /Jornadas de la temporada/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver calendario general/i })).toHaveAttribute(
      'href',
      '/calendario',
    );
    expect(screen.getByRole('link', { name: /Ver clasificación/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
  });

  it('has no accessibility violations in the matchday listing snapshot', async () => {
    const { container } = await render(LeagueMatchdaysPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Jornadas de la temporada/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
