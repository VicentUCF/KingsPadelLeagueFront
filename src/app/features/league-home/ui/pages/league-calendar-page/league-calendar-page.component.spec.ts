import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeatureTesting } from '../../testing/league-home-testing.providers';
import { LeagueCalendarPageComponent } from './league-calendar-page.component';

describe('LeagueCalendarPageComponent', () => {
  it('renders the published calendar with quick actions and filters', async () => {
    await render(LeagueCalendarPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', {
        name: /Calendario completo/i,
      }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornadas/i })).toHaveAttribute(
      'href',
      '/jornadas',
    );
    expect(screen.getByRole('link', { name: /Ver clasificación/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
    expect(screen.getAllByText(/Mostrando 10 de 10 cruces/i)[0]).toBeVisible();
  });

  it('has no accessibility violations in the calendar page snapshot', async () => {
    const { container } = await render(LeagueCalendarPageComponent, {
      providers: [...provideLeagueHomeFeatureTesting(), provideRouter([])],
    });

    await screen.findByRole('heading', {
      name: /Calendario completo/i,
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
