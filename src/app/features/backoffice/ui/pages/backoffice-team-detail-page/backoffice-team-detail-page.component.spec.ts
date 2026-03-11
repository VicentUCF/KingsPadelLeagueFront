import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { of } from 'rxjs';

import { provideBackofficeTeamsFeature } from '../../providers/backoffice-teams.providers';
import { BackofficeTeamDetailPageComponent } from './backoffice-team-detail-page.component';

describe('BackofficeTeamDetailPageComponent', () => {
  it('renders the selected team detail and switches tabs', async () => {
    await render(BackofficeTeamDetailPageComponent, {
      providers: [
        provideBackofficeTeamsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('barbaridad'),
      ],
    });

    expect(await screen.findByRole('heading', { name: /Barbaridad/i })).toBeVisible();
    expect(screen.getAllByText(/Color principal naranja quemado/i)).toHaveLength(2);

    await fireEvent.click(screen.getByRole('tab', { name: /Roster/i }));

    expect(screen.getByRole('heading', { name: /^Roster$/i })).toBeVisible();
    expect(screen.getByText(/Ivan Soto/i)).toBeVisible();

    await fireEvent.click(screen.getByRole('tab', { name: /President \/ Roles/i }));

    expect(screen.getByRole('heading', { name: /President \/ Roles/i })).toBeVisible();
    expect(screen.getByText(/Presidente: Romero/i)).toBeVisible();
  });

  it('shows the not found state for an invalid team id', async () => {
    await render(BackofficeTeamDetailPageComponent, {
      providers: [
        provideBackofficeTeamsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('unknown-team'),
      ],
    });

    expect(await screen.findByText(/No hemos encontrado este equipo/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a equipos/i })).toHaveAttribute(
      'href',
      '/backoffice/equipos',
    );
  });

  it('has no accessibility violations in the team detail', async () => {
    const { container } = await render(BackofficeTeamDetailPageComponent, {
      providers: [
        provideBackofficeTeamsFeature(),
        provideRouter([]),
        createActivatedRouteProvider('titanics'),
      ],
    });

    await screen.findByRole('heading', { name: /Titanics/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteProvider(teamId: string) {
  const paramMap = convertToParamMap({ teamId });

  return {
    provide: ActivatedRoute,
    useValue: {
      snapshot: { paramMap },
      paramMap: of(paramMap),
    },
  };
}
