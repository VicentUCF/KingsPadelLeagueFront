import { provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueTeamsPageComponent } from './league-teams-page.component';

describe('LeagueTeamsPageComponent', () => {
  it('renders the selector and updates the live preview when another team is chosen', async () => {
    await render(LeagueTeamsPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Equipos participantes/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver plantilla completa/i })).toHaveAttribute(
      'href',
      '/equipos/kings-of-favar',
    );

    await fireEvent.click(screen.getByRole('button', { name: /Titanics/i }));

    expect(screen.getByRole('heading', { name: /Titanics/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver plantilla completa/i })).toHaveAttribute(
      'href',
      '/equipos/titanics',
    );
  });

  it('has no accessibility violations in the interactive team selector page', async () => {
    const { container } = await render(LeagueTeamsPageComponent, {
      providers: [provideLeagueHomeFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Equipos participantes/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
