import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueCalendarPageComponent } from './league-calendar-page.component';

describe('LeagueCalendarPageComponent', () => {
  it('shows an empty state when no calendar has been published yet', async () => {
    await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', {
        name: /Calendario oficial de partidos/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornadas/i })).toHaveAttribute(
      'href',
      '/jornadas',
    );
    expect(screen.getByRole('link', { name: /Ver equipos inscritos/i })).toHaveAttribute(
      'href',
      '/equipos',
    );
  });

  it('has no accessibility violations in the calendar page snapshot', async () => {
    const { container } = await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', {
      name: /Calendario oficial de partidos/i,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
