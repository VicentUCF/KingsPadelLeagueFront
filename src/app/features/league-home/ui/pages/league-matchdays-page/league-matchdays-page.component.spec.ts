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
        name: /Calendario de jornadas de pádel en preparación/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Abrir calendario general/i })).toHaveAttribute(
      'href',
      '/calendario',
    );
    expect(screen.getByRole('link', { name: /Consultar clasificación/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
  });

  it('has no accessibility violations in the matchday listing snapshot', async () => {
    const { container } = await render(LeagueMatchdaysPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario de jornadas de pádel en preparación/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
