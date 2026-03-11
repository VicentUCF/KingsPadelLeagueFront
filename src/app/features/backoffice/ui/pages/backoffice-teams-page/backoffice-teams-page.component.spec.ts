import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
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
    expect(screen.getByRole('button', { name: /Crear equipo/i })).toBeDisabled();

    const teamCard = await screen.findByRole('article', { name: /Barbaridad/i });

    expect(within(teamCard).getByText(/Presidente actual: Romero/i)).toBeVisible();
    expect(within(teamCard).getByText(/6 jugadores regulares activos/i)).toBeVisible();
    expect(within(teamCard).getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/backoffice/equipos/barbaridad',
    );
  });

  it('has no accessibility violations in the teams list', async () => {
    const { container } = await render(BackofficeTeamsPageComponent, {
      providers: [provideBackofficeTeamsFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Equipos de la season activa/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
