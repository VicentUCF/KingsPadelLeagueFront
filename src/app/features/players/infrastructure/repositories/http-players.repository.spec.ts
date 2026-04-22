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
    expectSeasonsRequest().flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest().flush({
      items: [
        createMatchdayHttp({
          id: 'matchday-1',
          seasonId: 'season-2026',
          status: 'in_progress',
        }),
      ],
      meta: createMeta(1),
    });
    await flushAsyncWork();
    expectSeasonPlayerScoresRequest('season-2026').flush({
      items: [],
      meta: createMeta(0),
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
        totalPoints: 0,
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
    expectSeasonsRequest().flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest().flush({
      items: [
        createMatchdayHttp({
          id: 'matchday-1',
          seasonId: 'season-2026',
          status: 'scheduled',
        }),
      ],
      meta: createMeta(1),
    });
    await flushAsyncWork();
    expectSeasonPlayerScoresRequest('season-2026').flush({
      items: [],
      meta: createMeta(0),
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
    expectSeasonsRequest().flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest().flush({
      items: [
        createMatchdayHttp({
          id: 'matchday-1',
          seasonId: 'season-2026',
          status: 'scheduled',
        }),
      ],
      meta: createMeta(1),
    });
    await flushAsyncWork();
    expectSeasonPlayerScoresRequest('season-2026').flush({
      items: [],
      meta: createMeta(0),
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
    expectSeasonsRequest().flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest().flush({
      items: [
        createMatchdayHttp({
          id: 'matchday-1',
          seasonId: 'season-2026',
          status: 'scheduled',
        }),
      ],
      meta: createMeta(1),
    });
    await flushAsyncWork();
    expectSeasonPlayerScoresRequest('season-2026').flush({
      items: [],
      meta: createMeta(0),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-ruben',
        wonMatchesCount: 0,
        lostMatchesCount: 0,
        playedMatchesCount: 0,
        totalPoints: 0,
      }),
    ]);
  });

  it('prefers active season player scores over missing stats on /players', async () => {
    const playersPromise = repository.findAll();

    expectTeamsRequest().flush({
      items: [createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' })],
      meta: createMeta(1),
    });
    expectPlayersRequest().flush({
      items: [
        createPlayerHttp({
          id: 'player-vicent',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          teamId: 'team-kings',
          wonGames: undefined,
          lostGames: undefined,
        }),
      ],
      meta: createMeta(1),
    });
    expectSeasonsRequest().flush({
      items: [
        createSeasonHttp({
          id: 'season-2025',
          startsAt: '2025-01-01T00:00:00.000Z',
          endsAt: '2025-12-31T23:59:59.999Z',
        }),
        createSeasonHttp({
          id: 'season-2026',
          startsAt: '2026-01-01T00:00:00.000Z',
          endsAt: '2026-12-31T23:59:59.999Z',
        }),
      ],
      meta: createMeta(2),
    });
    expectMatchdaysRequest().flush({
      items: [
        createMatchdayHttp({
          id: 'matchday-1',
          seasonId: 'season-2026',
          status: 'in_progress',
        }),
      ],
      meta: createMeta(1),
    });
    await flushAsyncWork();
    expectSeasonPlayerScoresRequest('season-2026').flush({
      items: [
        createSeasonPlayerScoreHttp({
          playerId: 'player-vicent',
          seasonId: 'season-2026',
          totalPoints: 12,
          wonPairMatches: 3,
          lostPairMatches: 1,
          wonGames: 7,
          lostGames: 4,
        }),
      ],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-vicent',
        wonMatchesCount: 3,
        lostMatchesCount: 1,
        playedMatchesCount: 4,
        totalPoints: 12,
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

  function expectSeasonsRequest() {
    return httpTestingController.expectOne((request) => {
      return request.url === 'http://api.test/v1/seasons' && request.params.get('limit') === '50';
    });
  }

  function expectMatchdaysRequest() {
    return httpTestingController.expectOne((request) => {
      return (
        request.url === 'http://api.test/v1/matchdays' && request.params.get('limit') === '100'
      );
    });
  }

  function expectSeasonPlayerScoresRequest(seasonId: string) {
    return httpTestingController.expectOne(
      `http://api.test/v1/season-player-scores?limit=200&seasonIds=${encodeURIComponent(
        JSON.stringify([seasonId]),
      )}`,
    );
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

async function flushAsyncWork(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
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

function createSeasonHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'season-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    description: 'Temporada oficial',
    endsAt: '2026-12-31T23:59:59.999Z',
    name: 'Temporada Demo',
    startsAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function createMatchdayHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'matchday-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    name: 'Jornada Demo',
    scheduledAt: '2026-04-20T16:00:00.000Z',
    seasonId: 'season-id',
    status: 'scheduled',
    ...overrides,
  };
}

function createSeasonPlayerScoreHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'season-player-score-id',
    createdAt: '2026-04-20T16:00:00.000Z',
    playerId: 'player-id',
    seasonId: 'season-id',
    totalPoints: 0,
    wonGames: 0,
    lostGames: 0,
    wonPairMatches: 0,
    lostPairMatches: 0,
    wonSets: 0,
    lostSets: 0,
    ...overrides,
  };
}
