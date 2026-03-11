import { fireEvent, render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueCalendarPageComponent } from './league-calendar-page.component';

describe('LeagueCalendarPageComponent', () => {
  it('renders the calendar hero, summary metrics, grouped agenda and navigation links', async () => {
    await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Calendario completo/i })).toBeVisible();
    expect(screen.getByText(/Temporada 1/i)).toBeVisible();
    expect(screen.getByText('Mostrando 10 de 10 cruces')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver jornadas/i })).toHaveAttribute(
      'href',
      '/jornadas',
    );
    expect(screen.getByRole('link', { name: /Ver clasificación/i })).toHaveAttribute(
      'href',
      '/clasificacion',
    );
    expect(screen.getByRole('heading', { name: /Domingo 15 de marzo/i })).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: /Abrir jornada 3: Titanics vs House Perez/i,
      }),
    ).toHaveAttribute('href', '/jornadas/matchday-3');
  });

  it('filters the agenda by status and team', async () => {
    await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario completo/i });

    await fireEvent.click(screen.getByRole('button', { name: /^Programadas$/i }));
    await fireEvent.click(screen.getByRole('button', { name: /^Titanics$/i }));

    expect(screen.getByText('Mostrando 3 de 10 cruces')).toBeVisible();
    expect(
      screen.getByRole('link', {
        name: /Abrir jornada 4: Titanics vs Kings of Favar/i,
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole('link', {
        name: /Abrir jornada 2: Titanics vs Barbaridad/i,
      }),
    ).not.toBeInTheDocument();
  });

  it('shows an empty filtered state and allows clearing filters', async () => {
    await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario completo/i });

    await fireEvent.click(screen.getByRole('button', { name: /^En juego$/i }));
    await fireEvent.click(screen.getByRole('button', { name: /^Magic City$/i }));

    expect(screen.getByText('Mostrando 0 de 10 cruces')).toBeVisible();
    expect(screen.getByRole('heading', { name: /No hay cruces con estos filtros/i })).toBeVisible();

    await fireEvent.click(screen.getByRole('button', { name: /Limpiar filtros/i }));

    expect(screen.getByText('Mostrando 10 de 10 cruces')).toBeVisible();
    expect(screen.getByRole('heading', { name: /Domingo 15 de marzo/i })).toBeVisible();
  });

  it('has no accessibility violations in the calendar page snapshot', async () => {
    const { container } = await render(LeagueCalendarPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Calendario completo/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
