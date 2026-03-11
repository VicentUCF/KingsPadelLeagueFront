import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueMatchdayDetailPageComponent } from './league-matchday-detail-page.component';

describe('LeagueMatchdayDetailPageComponent', () => {
  it('shows an empty state when no matchday data has been published', async () => {
    const activatedRouteStub = createActivatedRouteStub('matchday-3');

    await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByText(/No hay jornadas disponibles/i)).toBeVisible();
    expect(
      screen.getByText(/Todavía no hay jornadas publicadas para construir este detalle/i),
    ).toBeVisible();
  });

  it('shows a not found state for an unknown matchday id', async () => {
    const activatedRouteStub = createActivatedRouteStub('unknown-matchday');

    await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    expect(await screen.findByText(/No hay jornadas disponibles/i)).toBeVisible();
    expect(
      screen.getByText(/Todavía no hay jornadas publicadas para construir este detalle/i),
    ).toBeVisible();
  });

  it('has no accessibility violations in the matchday detail snapshot', async () => {
    const activatedRouteStub = createActivatedRouteStub('matchday-3');

    const { container } = await render(LeagueMatchdayDetailPageComponent, {
      providers: [
        provideLeagueHomeFeature(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: activatedRouteStub.route,
        },
      ],
    });

    await screen.findByText(/No hay jornadas disponibles/i);

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
