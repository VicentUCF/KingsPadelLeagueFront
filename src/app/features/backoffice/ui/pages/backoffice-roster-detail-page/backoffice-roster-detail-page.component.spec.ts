import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideBackofficeRostersFeature } from '../../providers/backoffice-rosters.providers';
import { BackofficeRosterDetailPageComponent } from './backoffice-roster-detail-page.component';

describe('BackofficeRosterDetailPageComponent', () => {
  it('renders roster detail and switches tabs', async () => {
    await render(BackofficeRosterDetailPageComponent, {
      providers: [
        provideBackofficeRostersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('roster-barbaridad-2026'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Barbaridad/i })).toBeVisible();
    expect(screen.getByText(/5\/6 regulares activos/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: /Memberships activas/i })).toBeVisible();
    expect(screen.getByText(/Ivan Soto · Regular · Activa/i)).toBeVisible();

    await fireEvent.click(screen.getByRole('tab', { name: /Pendientes/i }));

    expect(screen.getByRole('heading', { name: /Solicitudes pendientes/i })).toBeVisible();
    expect(screen.getByText(/Alta de sexto regular/i)).toBeVisible();

    await fireEvent.click(screen.getByRole('tab', { name: /Reglas/i }));

    expect(screen.getByRole('heading', { name: /Restricciones visibles/i })).toBeVisible();
    expect(
      screen.getByText(/La plantilla activa no puede superar 6 regulares simultáneos/i),
    ).toBeVisible();
  });

  it('shows the not found state for an invalid roster id', async () => {
    await render(BackofficeRosterDetailPageComponent, {
      providers: [
        provideBackofficeRostersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('missing-roster'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado esta plantilla/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a plantillas/i })).toHaveAttribute(
      'href',
      '/backoffice/plantillas',
    );
  });

  it('has no accessibility violations in the roster detail', async () => {
    const { container } = await render(BackofficeRosterDetailPageComponent, {
      providers: [
        provideBackofficeRostersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('roster-titanics-2026'),
      ],
    });

    await screen.findByRole('heading', { name: /Titanics/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(rosterId: string) {
  const paramMap = convertToParamMap({ rosterId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}
