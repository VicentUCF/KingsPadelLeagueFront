import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { Subject } from 'rxjs';

import { provideLeagueHomeFeature } from '../../providers/league-home.providers';
import { LeagueMatchdayDetailPageComponent } from './league-matchday-detail-page.component';

describe('LeagueMatchdayDetailPageComponent', () => {
  it('renders the selected matchday with all encounters and pair results', async () => {
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

    expect(await screen.findByRole('heading', { name: /Jornada 3/i })).toBeVisible();
    expect(screen.getByRole('heading', { name: /Kings of Favar vs Barbaridad/i })).toBeVisible();
    expect(screen.getAllByText('Partido 1').length).toBeGreaterThan(0);
    expect(screen.getByText('Alejandro Mena')).toBeVisible();
    expect(screen.getByText('Raul Pizarro')).toBeVisible();
    expect(screen.getByText('Jornada 3 · Descansa')).toBeVisible();
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

    expect(await screen.findByText(/Jornada no encontrada/i)).toBeVisible();
    expect(screen.getByRole('link', { name: /Volver a jornadas/i })).toHaveAttribute(
      'href',
      '/jornadas',
    );
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
