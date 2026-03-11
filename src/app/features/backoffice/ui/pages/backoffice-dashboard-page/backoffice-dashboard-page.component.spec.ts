import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideBackofficeFeature } from '../../providers/backoffice.providers';
import { BackofficeDashboardPageComponent } from './backoffice-dashboard-page.component';

describe('BackofficeDashboardPageComponent', () => {
  it('renders the operational dashboard snapshot from the feature provider graph', async () => {
    await render(BackofficeDashboardPageComponent, {
      providers: [provideBackofficeFeature(), provideRouter([])],
    });

    expect(await screen.findByText('Temporada 2026')).toBeVisible();
    expect(screen.getByRole('heading', { name: /Temporada activa/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Próxima jornada/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Solicitudes pendientes/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Sanciones recientes/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Estado MVP/i })).toBeVisible();
    expect(screen.getByText('3 convocatorias pendientes')).toBeVisible();
    expect(screen.getByText('2 cambios de plantilla')).toBeVisible();
    expect(screen.getByText('1 invitado pendiente')).toBeVisible();
    expect(screen.getByText('Votación interna abierta')).toBeVisible();
  });

  it('has no accessibility violations in the dashboard page', async () => {
    const { container } = await render(BackofficeDashboardPageComponent, {
      providers: [provideBackofficeFeature(), provideRouter([])],
    });

    await screen.findByText('Temporada 2026');

    expect(await axe(container)).toHaveNoViolations();
  });
});
