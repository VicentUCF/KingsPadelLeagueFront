import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideBackofficeSeasonsFeature } from '../../providers/backoffice-seasons.providers';
import { BackofficeSeasonDetailPageComponent } from './backoffice-season-detail-page.component';

describe('BackofficeSeasonDetailPageComponent', () => {
  it('renders the selected season detail with teams, matchdays and standings', async () => {
    await render(BackofficeSeasonDetailPageComponent, {
      providers: [
        provideBackofficeSeasonsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('season-2026'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Temporada 2026/i })).toBeVisible();
    expect(screen.getByText('Operativa habilitada')).toBeVisible();
    expect(screen.getByRole('heading', { name: /Datos básicos/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Equipos asociados/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Jornadas/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Clasificación snapshot/i })).toBeVisible();
    expect(screen.getByText('Kings of Favar')).toBeVisible();
    expect(screen.getByText(/Jornada 4/i)).toBeVisible();

    const standingsTable = screen.getByRole('table', { name: /Clasificación snapshot/i });

    expect(within(standingsTable).getByText('Titanics')).toBeVisible();
    expect(screen.getByRole('button', { name: /Editar season/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /Finalizar season/i })).toBeEnabled();
  });

  it('opens the edit dialog with the season data prefilled', async () => {
    const { fixture } = await render(BackofficeSeasonDetailPageComponent, {
      providers: [
        provideBackofficeSeasonsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('season-2026'),
      ],
    });

    await screen.findByRole('heading', { name: /Temporada 2026/i });

    await fireEvent.click(screen.getByRole('button', { name: /Editar season/i }));
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Editar season/i })).toBeVisible();
    expect(screen.getByDisplayValue('Temporada 2026')).toBeVisible();
    expect(screen.getByDisplayValue('2026')).toBeVisible();
  });

  it('confirms season status transitions from the detail header', async () => {
    const { fixture } = await render(BackofficeSeasonDetailPageComponent, {
      providers: [
        provideBackofficeSeasonsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('season-2026'),
      ],
    });

    await screen.findByRole('heading', { name: /Temporada 2026/i });

    await fireEvent.click(screen.getByRole('button', { name: /Finalizar season/i }));
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Finalizar season/i })).toBeVisible();

    const confirmButtons = screen.getAllByRole('button', { name: /Finalizar season/i });

    expect(confirmButtons).toHaveLength(2);

    await fireEvent.click(confirmButtons[1]!);
    fixture.detectChanges();

    expect(await screen.findByText('Operativa cerrada')).toBeVisible();
  });

  it('shows the not found state for an unknown season id', async () => {
    await render(BackofficeSeasonDetailPageComponent, {
      providers: [
        provideBackofficeSeasonsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('season-missing'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado esta season/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a temporadas/i })).toHaveAttribute(
      'href',
      '/backoffice/temporadas',
    );
  });

  it('has no accessibility violations in the season detail page', async () => {
    const { container } = await render(BackofficeSeasonDetailPageComponent, {
      providers: [
        provideBackofficeSeasonsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('season-2026'),
      ],
    });

    await screen.findByRole('heading', { name: /Temporada 2026/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(seasonId: string) {
  const paramMap = convertToParamMap({ seasonId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}
