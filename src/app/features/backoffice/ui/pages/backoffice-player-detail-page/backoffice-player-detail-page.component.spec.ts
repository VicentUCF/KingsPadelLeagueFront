import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideBackofficePlayersFeature } from '../../providers/backoffice-players.providers';
import { BackofficePlayerDetailPageComponent } from './backoffice-player-detail-page.component';

describe('BackofficePlayerDetailPageComponent', () => {
  it('renders player detail with memberships, participations and user linkage', async () => {
    await render(BackofficePlayerDetailPageComponent, {
      providers: [
        provideBackofficePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('player-alex-soler'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Alex Soler/i })).toBeVisible();
    expect(screen.getByText(/Equipo actual derivado: Kings of Favar/i)).toBeVisible();
    expect(screen.getByRole('heading', { name: /Memberships históricas/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Participaciones/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Nominaciones MVP/i })).toBeVisible();
    expect(screen.getByText(/Jornada 3 · Kings of Favar/i)).toBeVisible();
    expect(screen.getByText(/Cuenta vinculada: alex.soler@kings.test/i)).toBeVisible();
  });

  it('shows a not found state for an invalid player id', async () => {
    await render(BackofficePlayerDetailPageComponent, {
      providers: [
        provideBackofficePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('missing-player'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado este jugador/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a jugadores/i })).toHaveAttribute(
      'href',
      '/backoffice/jugadores',
    );
  });

  it('has no accessibility violations in the player detail', async () => {
    const { container } = await render(BackofficePlayerDetailPageComponent, {
      providers: [
        provideBackofficePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('player-marco-vidal'),
      ],
    });

    await screen.findByRole('heading', { name: /Marco Vidal/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(playerId: string) {
  const paramMap = convertToParamMap({ playerId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}
