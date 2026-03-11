import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideBackofficePlayersFeature } from '../../providers/backoffice-players.providers';
import { BackofficePlayersPageComponent } from './backoffice-players-page.component';

describe('BackofficePlayersPageComponent', () => {
  it('renders the players list with derived current team and user linkage', async () => {
    await render(BackofficePlayersPageComponent, {
      providers: [provideBackofficePlayersFeature(), provideRouter([])],
    });

    expect(
      await screen.findByRole('heading', { name: /Directorio global de jugadores/i }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Crear ficha/i })).toBeEnabled();

    const playerCard = await screen.findByRole('article', { name: /Alex Soler/i });

    expect(within(playerCard).getByText(/Equipo actual derivado: Kings of Favar/i)).toBeVisible();
    expect(within(playerCard).getByText(/User vinculado/i)).toBeVisible();
    expect(within(playerCard).getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/backoffice/jugadores/player-alex-soler',
    );
  });

  it('opens the player creation wizard from the list page', async () => {
    const { fixture } = await render(BackofficePlayersPageComponent, {
      providers: [provideBackofficePlayersFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Directorio global de jugadores/i });

    await fireEvent.click(screen.getByRole('button', { name: /Crear ficha/i }));
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Crear ficha/i })).toBeVisible();
    expect(screen.getByText(/La ficha define el perfil base del jugador/i)).toBeVisible();
  });

  it('has no accessibility violations in the players list', async () => {
    const { container } = await render(BackofficePlayersPageComponent, {
      providers: [provideBackofficePlayersFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Directorio global de jugadores/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
