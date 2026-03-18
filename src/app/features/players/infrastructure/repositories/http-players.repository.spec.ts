import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';

import { HttpPlayersRepository } from './http-players.repository';

describe('HttpPlayersRepository', () => {
  let repository: HttpPlayersRepository;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpPlayersRepository,
      ],
    });

    repository = TestBed.inject(HttpPlayersRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('maps the public roster and reuses the cached dataset across list and profile queries', async () => {
    const playersPromise = repository.findAll();

    expectTeamsRequest().flush({
      items: [
        createTeamHttp({
          id: 'team-kings',
          name: 'Kings Of Favar',
          logo: 'https://cdn.test/kings.png',
        }),
      ],
      meta: createMeta(1),
    });
    expectPlayersRequest().flush({
      items: [
        createPlayerHttp({
          id: 'player-vicent',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          preferredPosition: 'both',
          teamId: 'team-kings',
          wonGames: 4,
          lostGames: 1,
        }),
      ],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-vicent',
        slug: 'vicent-ciscar',
        displayName: 'Vicent Ciscar',
        teamId: 'team-kings',
        teamName: 'Kings Of Favar',
        teamLogoPath: 'https://cdn.test/kings.png',
        wonMatchesCount: 4,
        lostMatchesCount: 1,
        side: 'ambas',
      }),
    ]);

    await expect(repository.findBySlug('vicent-ciscar')).resolves.toEqual(
      expect.objectContaining({
        id: 'player-vicent',
        displayName: 'Vicent Ciscar',
      }),
    );

    httpTestingController.expectNone((request) => request.url.startsWith('http://api.test/v1/'));
  });

  it('bypasses the cache when forceRefresh is requested', async () => {
    const firstLoadPromise = repository.findAll();

    expectTeamsRequest().flush({
      items: [createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' })],
      meta: createMeta(1),
    });
    expectPlayersRequest().flush({
      items: [createPlayerHttp({ id: 'player-vicent', firstName: 'Vicent', lastName: 'Ciscar' })],
      meta: createMeta(1),
    });

    await firstLoadPromise;

    const refreshPromise = repository.findAll(true);

    expectTeamsRequest().flush({
      items: [createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' })],
      meta: createMeta(1),
    });
    expectPlayersRequest().flush({
      items: [createPlayerHttp({ id: 'player-vicent', firstName: 'Vicent', lastName: 'Ciscar' })],
      meta: createMeta(1),
    });

    await expect(refreshPromise).resolves.toHaveLength(1);
  });

  it('normalizes missing competitive stats from the backend contract', async () => {
    const playersPromise = repository.findAll();

    expectTeamsRequest().flush({
      items: [createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' })],
      meta: createMeta(1),
    });
    expectPlayersRequest().flush({
      items: [
        createPlayerHttp({
          id: 'player-ruben',
          firstName: 'Ruben',
          lastName: 'Marzal',
          wonGames: undefined,
          lostGames: undefined,
        }),
      ],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-ruben',
        wonMatchesCount: 0,
        lostMatchesCount: 0,
        playedMatchesCount: 0,
      }),
    ]);
  });

  function expectTeamsRequest() {
    return httpTestingController.expectOne((request) => {
      return request.url === 'http://api.test/v1/teams' && request.params.get('limit') === '100';
    });
  }

  function expectPlayersRequest() {
    return httpTestingController.expectOne((request) => {
      return request.url === 'http://api.test/v1/players' && request.params.get('limit') === '200';
    });
  }
});

function createMeta(itemCount: number) {
  return {
    currentPage: 1,
    itemCount,
    itemsPerPage: itemCount,
    totalItems: itemCount,
    totalPages: 1,
  };
}

function createTeamHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'team-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    description: 'Descripción oficial',
    secondaryDescription: 'Identidad del equipo',
    logo: 'https://cdn.test/team.png',
    name: 'Equipo Demo',
    ...overrides,
  };
}

function createPlayerHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'player-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    firstName: 'Jugador',
    lastName: 'Demo',
    email: 'demo@example.com',
    description: 'Perfil oficial',
    profileImage: 'https://cdn.test/player.png',
    isPresident: false,
    value: 0,
    wonGames: 0,
    lostGames: 0,
    preferredPosition: 'right',
    ...overrides,
  };
}
