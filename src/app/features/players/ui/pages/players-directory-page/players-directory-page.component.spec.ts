import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { providePlayersFeature } from '../../providers/players.providers';
import { PlayersDirectoryPageComponent } from './players-directory-page.component';

describe('PlayersDirectoryPageComponent', () => {
  it('renders the ranking with a heading and player links', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Ranking de jugadores/i })).toBeVisible();
    expect(await screen.findByRole('link', { name: /Alex Soler/i })).toBeVisible();
    expect(screen.getByRole('searchbox')).toBeVisible();
  });

  it('renders all players in a ranked list', async () => {
    await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersFeature(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Alex Soler/i });

    const list = screen.getByRole('list', { name: /Ranking de jugadores/i });

    expect(list).toBeVisible();
  });

  it('has no accessibility violations in the ranking view', async () => {
    const { container } = await render(PlayersDirectoryPageComponent, {
      providers: [providePlayersFeature(), provideRouter([])],
    });

    await screen.findByRole('link', { name: /Alex Soler/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
