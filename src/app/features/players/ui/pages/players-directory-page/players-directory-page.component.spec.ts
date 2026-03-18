import { provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { LoadPlayersUseCase } from '@features/players/application/use-cases/load-players.use-case';
import { InMemoryPlayersRepository } from '@features/players/infrastructure/repositories/in-memory-players.repository';
import { LOAD_PLAYERS_USE_CASE } from '../../providers/players.providers';
import { PlayersDirectoryPageComponent } from './players-directory-page.component';

describe('PlayersDirectoryPageComponent', () => {
  it('renders the public directory with a heading and player links', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersDirectoryPageTesting(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /Jugadores de la KingsPadelLeague/i }),
    ).toBeVisible();
    expect(await screen.findByRole('link', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getByRole('searchbox')).toBeVisible();
  });

  it('publishes all players while keeping presidents attached to their teams', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersDirectoryPageTesting(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Vicent Ciscar/i });

    expect(screen.getByText(/30 jugadores inscritos/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Enric Bixquert/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Vicent Ciscar/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Adri Alvarez/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Adrian Asuncion/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Alex Pla/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Brigante/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ruben Marzal/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Samu/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Borja Vercher/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Artur Peris/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Damian Crespo/i })).toBeVisible();
    expect(screen.getByRole('option', { name: /Titanics/i })).toBeVisible();
    expect(screen.getByRole('option', { name: /Sin equipo todavía/i })).toBeVisible();
  });

  it('renders all players in a ranked list', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersDirectoryPageTesting(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Vicent Ciscar/i });

    const list = screen.getByRole('list', { name: /Directorio de jugadores/i });

    expect(list).toBeVisible();
  });

  it('filters the directory by assignment state and side while keeping the search global', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersDirectoryPageTesting(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Vicent Ciscar/i });

    fireEvent.input(screen.getByRole('searchbox'), {
      target: { value: 'reves' },
    });
    fireEvent.change(screen.getByLabelText(/^Equipo$/i), {
      target: { value: 'Sin equipo todavía' },
    });

    expect(screen.getByRole('link', { name: /Carles Montilla/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Adrian Asuncion/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /Vicent Ciscar/i })).toBeNull();
  });

  it('has no accessibility violations in the directory view', async () => {
    const { container } = await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersDirectoryPageTesting(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Vicent Ciscar/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function providePlayersDirectoryPageTesting() {
  return [
    InMemoryPlayersRepository,
    {
      provide: LOAD_PLAYERS_USE_CASE,
      useFactory: (playersRepository: InMemoryPlayersRepository) =>
        new LoadPlayersUseCase(playersRepository),
      deps: [InMemoryPlayersRepository],
    },
  ];
}
