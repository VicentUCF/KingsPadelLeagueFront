import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideBackofficeTeamsFeature } from '../../providers/backoffice-teams.providers';
import { BackofficeTeamsPageComponent } from './backoffice-teams-page.component';

describe('BackofficeTeamsPageComponent', () => {
  it('renders the active season teams list with president and roster summary', async () => {
    await render(BackofficeTeamsPageComponent, {
      providers: [provideBackofficeTeamsFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /Equipos de la season activa/i }),
    ).toBeVisible();
    await screen.findByRole('article', { name: /Barbaridad/i });

    expect(screen.getByRole('button', { name: /Crear equipo/i })).toBeEnabled();
    expect(screen.getByText(/Los nuevos equipos se asociarán a Temporada 2026/i)).toBeVisible();
    const teamCard = screen.getByRole('article', { name: /Barbaridad/i });

    expect(within(teamCard).getByText(/Presidente actual: Romero/i)).toBeVisible();
    expect(within(teamCard).getByText(/6 jugadores regulares activos/i)).toBeVisible();
    expect(within(teamCard).getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/backoffice/equipos/barbaridad',
    );
  });

  it('opens the team creation wizard from the list page', async () => {
    const { fixture } = await render(BackofficeTeamsPageComponent, {
      providers: [provideBackofficeTeamsFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Equipos de la season activa/i });

    await fireEvent.click(screen.getByRole('button', { name: /Crear equipo/i }));
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Crear equipo/i })).toBeVisible();
    expect(screen.getByText(/se asociará automáticamente a la season activa/i)).toBeVisible();
  });

  it('has no accessibility violations in the teams list', async () => {
    const { container } = await render(BackofficeTeamsPageComponent, {
      providers: [provideBackofficeTeamsFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Equipos de la season activa/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
