import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { providePlayersFeature } from '../../providers/players.providers';
import { PlayerProfilePageComponent } from './player-profile-page.component';

describe('PlayerProfilePageComponent', () => {
  it('renders the selected player profile', async () => {
    const { container } = await render(PlayerProfilePageComponent, {
      providers: [
        providePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('vicent-ciscar'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getAllByText('Kings Of Favar').length).toBeGreaterThan(0);
    expect(screen.getByText('Partidos ganados')).toBeVisible();
    expect(screen.getByText('Partidos perdidos')).toBeVisible();
    const teamShowcase = screen.getByRole('region', { name: /Equipo Kings Of Favar/i });
    const brandedLayout = teamShowcase.closest('.player-profile-page__layout');

    expect(brandedLayout).not.toBeNull();
    expect(brandedLayout).toHaveAttribute(
      'style',
      expect.stringContaining('--player-team-primary: #f3c84b'),
    );
    expect(container.querySelector('.player-profile-page__brand-watermark-image')).not.toBeNull();
    expect(screen.getByRole('link', { name: /Volver a jugadores/i })).toHaveAttribute(
      'href',
      '/jugadores',
    );
  });

  it('renders the not found state for an invalid player slug', async () => {
    await render(PlayerProfilePageComponent, {
      providers: [
        providePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('missing-player'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado este jugador/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a jugadores/i })).toHaveAttribute(
      'href',
      '/jugadores',
    );
  });

  it('has no accessibility violations in the player profile', async () => {
    const { container } = await render(PlayerProfilePageComponent, {
      providers: [
        providePlayersFeature(),
        provideRouter([]),
        createActivatedRouteProvider('vicent-ciscar'),
      ],
    });

    await screen.findByRole('heading', { name: /Vicent Ciscar/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(slug: string) {
  const paramMap = convertToParamMap({ slug });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}
