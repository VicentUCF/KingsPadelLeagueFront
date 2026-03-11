import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueTeamProfilePageComponent } from './league-team-profile-page.component';

describe('LeagueTeamProfilePageComponent', () => {
  it('renders the team hero and roster for a valid slug', async () => {
    const activatedRouteStub = createActivatedRouteStub('titanics');

    await render(LeagueTeamProfilePageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByRole('heading', { name: /^Titanics$/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Plantilla del equipo/i })).toBeVisible();
    expect(screen.getByText('Marco Vidal')).toBeVisible();
    expect(screen.getByText('Gonzalo Riera')).toBeVisible();
  });

  it('updates the rendered profile when the slug changes on the same component instance', async () => {
    const activatedRouteStub = createActivatedRouteStub('titanics');

    await render(LeagueTeamProfilePageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    await screen.findByRole('heading', { name: /^Titanics$/i });

    activatedRouteStub.paramMapSubject.next(convertToParamMap({ slug: 'magic-city' }));

    expect(await screen.findByRole('heading', { name: /^Magic City$/i })).toBeVisible();
    expect(screen.getByText('Alberto Casas')).toBeVisible();
  });

  it('shows a not found state for an unknown team slug', async () => {
    const activatedRouteStub = createActivatedRouteStub('unknown-team');

    await render(LeagueTeamProfilePageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByText(/Equipo no encontrado/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a equipos/i })).toHaveAttribute(
      'href',
      '/equipos',
    );
  });

  it('has no accessibility violations in the team profile snapshot', async () => {
    const activatedRouteStub = createActivatedRouteStub('kings-of-favar');

    const { container } = await render(LeagueTeamProfilePageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    await screen.findByRole('heading', { name: /^Kings of Favar$/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteStub(initialSlug: string) {
  const paramMapSubject = new Subject<ReturnType<typeof convertToParamMap>>();

  return {
    paramMapSubject,
    route: {
      snapshot: {
        paramMap: convertToParamMap({ slug: initialSlug }),
      },
      paramMap: paramMapSubject.asObservable(),
    },
  };
}
