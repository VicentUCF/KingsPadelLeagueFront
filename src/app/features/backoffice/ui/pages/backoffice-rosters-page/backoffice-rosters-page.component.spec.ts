import { provideRouter } from '@angular/router';
import { render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideBackofficeRostersFeature } from '../../providers/backoffice-rosters.providers';
import { BackofficeRostersPageComponent } from './backoffice-rosters-page.component';

describe('BackofficeRostersPageComponent', () => {
  it('renders the rosters list with pending requests and guest visibility', async () => {
    await render(BackofficeRostersPageComponent, {
      providers: [provideBackofficeRostersFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /Plantillas activas de la season/i }),
    ).toBeVisible();
    expect(
      await screen.findByText(
        /Temporada 2026 · 3 solicitudes pendientes · 2 plantillas en revisión/i,
      ),
    ).toBeVisible();

    const rosterCard = await screen.findByRole('article', { name: /Barbaridad/i });

    expect(within(rosterCard).getByText(/5\/6 regulares activos/i)).toBeVisible();
    expect(within(rosterCard).getByText(/1 invitado activo/i)).toBeVisible();
    expect(within(rosterCard).getByText(/2 solicitudes pendientes/i)).toBeVisible();
    expect(within(rosterCard).getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/backoffice/plantillas/roster-barbaridad-2026',
    );
  });

  it('has no accessibility violations in the rosters list', async () => {
    const { container } = await render(BackofficeRostersPageComponent, {
      providers: [provideBackofficeRostersFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Plantillas activas de la season/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
