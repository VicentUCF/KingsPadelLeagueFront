import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';

import { provideLeagueHomeFeatureTesting } from '../../testing/league-home-testing.providers';
import { LeagueMatchdayDetailPageComponent } from './league-matchday-detail-page.component';

describe('LeagueMatchdayDetailPageComponent', () => {
  it('shows the published detail for a current matchday', async () => {
    const activatedRouteStub = createActivatedRouteStub('jornada-3');

    await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        ...provideLeagueHomeFeatureTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByRole('heading', { name: /Jornada 3/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a jornadas/i })).toHaveAttribute(
      'href',
      '/jornadas',
    );
    expect(screen.getByText(/Descanso de la jornada/i)).toBeVisible();
    expect(screen.getByText(/Cruces de la jornada/i)).toBeVisible();
    expect(screen.getAllByText(/Todavía no hay resultados publicados por pareja/i)).toHaveLength(2);
  });

  it('shows a not found state for an unknown matchday id', async () => {
    const activatedRouteStub = createActivatedRouteStub('unknown-matchday');

    await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        ...provideLeagueHomeFeatureTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByText(/Jornada no encontrada/i)).toBeVisible();
    expect(
      screen.getByText(/Vuelve al listado de jornadas para abrir una jornada publicada/i),
    ).toBeVisible();
  });

  it('has no accessibility violations in the matchday detail snapshot', async () => {
    const activatedRouteStub = createActivatedRouteStub('jornada-3');

    const { container } = await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        ...provideLeagueHomeFeatureTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    await screen.findByRole('heading', { name: /Jornada 3/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});

function createActivatedRouteStub(initialMatchdayId: string) {
  const paramMapSubject = new Subject<ReturnType<typeof convertToParamMap>>();

  return {
    paramMapSubject,
    route: {
      snapshot: {
        paramMap: convertToParamMap({ matchdayId: initialMatchdayId }),
      },
      paramMap: paramMapSubject.asObservable(),
    },
  };
}
