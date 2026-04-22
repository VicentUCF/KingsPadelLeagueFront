import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { NavigationHistoryService } from '@core/services/navigation-history.service';
import { LoadPlayerProfileUseCase } from '@features/players/application/use-cases/load-player-profile.use-case';
import { InMemoryPlayersRepository } from '@features/players/infrastructure/repositories/in-memory-players.repository';
import { LOAD_PLAYER_PROFILE_USE_CASE } from '../../providers/players.providers';
import { PlayerProfilePageComponent } from './player-profile-page.component';

describe('PlayerProfilePageComponent', () => {
  it('renders the selected player profile', async () => {
    const { container } = await render(PlayerProfilePageComponent, {
      providers: [
        providePlayerProfilePageTesting(),
        provideRouter([]),
        createActivatedRouteProvider('vicent-ciscar'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getAllByText('Kings Of Favar').length).toBeGreaterThan(0);
    expect(screen.getByText('Partidos ganados')).toBeVisible();
    expect(screen.getByText('Partidos perdidos')).toBeVisible();
    expect(screen.getByText('PTS 0')).toBeVisible();
    const teamShowcase = screen.getByRole('region', { name: /Equipo Kings Of Favar/i });
    const brandedLayout = teamShowcase.closest('.player-profile-page__layout');

    expect(brandedLayout).not.toBeNull();
    expect(brandedLayout).toHaveAttribute(
      'style',
      expect.stringContaining('--player-team-primary: #f3c84b'),
    );
    expect(container.querySelector('.player-profile-page__brand-watermark-image')).not.toBeNull();
    expect(screen.getByRole('button', { name: /Volver a jugadores/i })).toBeVisible();
  });

  it('renders the current team assignment for players in the confirmed roster', async () => {
    const { container } = await render(PlayerProfilePageComponent, {
      providers: [
        providePlayerProfilePageTesting(),
        provideRouter([]),
        createActivatedRouteProvider('alex-pla'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Alex Pla/i })).toBeVisible();
    expect(screen.getAllByText('Barbaridad Team').length).toBeGreaterThan(0);
    expect(screen.getByRole('region', { name: /Equipo Barbaridad Team/i })).toBeVisible();
    expect(container.querySelector('.player-profile-page__brand-watermark-image')).not.toBeNull();
  });

  it('renders the not found state for an invalid player slug', async () => {
    await render(PlayerProfilePageComponent, {
      providers: [
        providePlayerProfilePageTesting(),
        provideRouter([]),
        createActivatedRouteProvider('missing-player'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado este jugador/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /Volver a jugadores/i })).toBeVisible();
  });

  it('delegates the back action to the navigation history service with the directory fallback', async () => {
    await render(PlayerProfilePageComponent, {
      providers: [
        providePlayerProfilePageTesting(),
        provideRouter([]),
        createActivatedRouteProvider('vicent-ciscar'),
      ],
    });

    await screen.findByRole('heading', { name: /Vicent Ciscar/i });

    const navigationHistory = TestBed.inject(NavigationHistoryService);
    const goBackSpy = jest.spyOn(navigationHistory, 'goBack').mockImplementation();

    await fireEvent.click(screen.getByRole('button', { name: /Volver a jugadores/i }));

    expect(goBackSpy).toHaveBeenCalledWith('/jugadores');
  });

  it('has no accessibility violations in the player profile', async () => {
    const { container } = await render(PlayerProfilePageComponent, {
      providers: [
        providePlayerProfilePageTesting(),
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

function providePlayerProfilePageTesting() {
  return [
    InMemoryPlayersRepository,
    {
      provide: LOAD_PLAYER_PROFILE_USE_CASE,
      useFactory: (playersRepository: InMemoryPlayersRepository) =>
        new LoadPlayerProfileUseCase(playersRepository),
      deps: [InMemoryPlayersRepository],
    },
  ];
}
