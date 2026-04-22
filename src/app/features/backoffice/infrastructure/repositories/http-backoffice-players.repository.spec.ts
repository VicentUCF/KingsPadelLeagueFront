import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficePlayersRepository } from './http-backoffice-players.repository';

describe('HttpBackofficePlayersRepository', () => {
  let repository: HttpBackofficePlayersRepository;
  let httpTestingController: HttpTestingController;
  let currentRole: ReturnType<typeof signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>>;

  beforeEach(() => {
    currentRole = signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>('PLAYER');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        {
          provide: AuthStore,
          useValue: {
            currentRole: computed(() => currentRole()),
          },
        },
        HttpBackofficePlayersRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficePlayersRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('normalizes missing competitive stats from the backend contract', async () => {
    currentRole.set('PLAYER');

    const playersPromise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/v1/players?limit=200').flush({
      items: [
        createPlayerHttp({
          id: 'player-ruben',
          firstName: 'Ruben',
          lastName: 'Marzal',
          wonGames: undefined,
          lostGames: undefined,
          value: undefined,
        }),
      ],
      meta: createMeta(1),
    });
    expectSeasonsRequest(currentRole()).flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest(currentRole()).flush({
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
    expectSeasonPlayerScoresRequest(currentRole(), 'season-2026').flush({
      items: [],
      meta: createMeta(0),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-ruben',
        wonGames: 0,
        lostGames: 0,
        value: 0,
      }),
    ]);
  });

  it('uses /admin/v1 for admin reads', async () => {
    currentRole.set('ADMIN');

    const playersPromise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/admin/v1/players?limit=200').flush({
      items: [createPlayerHttp({ id: 'player-admin' })],
      meta: createMeta(1),
    });
    expectSeasonsRequest(currentRole()).flush({
      items: [createSeasonHttp({ id: 'season-2026' })],
      meta: createMeta(1),
    });
    expectMatchdaysRequest(currentRole()).flush({
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
    expectSeasonPlayerScoresRequest(currentRole(), 'season-2026').flush({
      items: [],
      meta: createMeta(0),
    });

    await expect(playersPromise).resolves.toHaveLength(1);
  });

  it('uses active season player scores as the displayed record', async () => {
    currentRole.set('PLAYER');

    const playersPromise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/v1/players?limit=200').flush({
      items: [
        createPlayerHttp({
          id: 'player-vicent',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          wonGames: undefined,
          lostGames: undefined,
        }),
      ],
      meta: createMeta(1),
    });
    expectSeasonsRequest(currentRole()).flush({
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
    expectMatchdaysRequest(currentRole()).flush({
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
    expectSeasonPlayerScoresRequest(currentRole(), 'season-2026').flush({
      items: [
        createSeasonPlayerScoreHttp({
          playerId: 'player-vicent',
          seasonId: 'season-2026',
          wonPairMatches: 2,
          lostPairMatches: 1,
          wonGames: 5,
          lostGames: 3,
        }),
      ],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-vicent',
        wonGames: 2,
        lostGames: 1,
      }),
    ]);
  });

  it('updates a player through the writable v1 endpoint', async () => {
    const promise = repository.update('player-7', {
      alias: 'Briga',
      firstName: 'Brigante',
      lastName: 'Demo',
      preferredPosition: 'both',
      instagramUrl: 'https://instagram.com/briga',
      profileImage: 'https://cdn.test/briga.png',
    });

    const request = httpTestingController.expectOne('http://api.test/v1/players/player-7');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      alias: 'Briga',
      firstName: 'Brigante',
      lastName: 'Demo',
      preferredPosition: 'both',
      instagramUrl: 'https://instagram.com/briga',
      profileImage: 'https://cdn.test/briga.png',
    });
    request.flush(null);

    await expect(promise).resolves.toBeUndefined();
  });
});

function expectSeasonsRequest(role: 'ADMIN' | 'PRESIDENT' | 'PLAYER') {
  return TestBed.inject(HttpTestingController).expectOne((request) => {
    return (
      request.url === `http://api.test/${role === 'ADMIN' ? 'admin/' : ''}v1/seasons` &&
      request.params.get('limit') === '50'
    );
  });
}

function expectMatchdaysRequest(role: 'ADMIN' | 'PRESIDENT' | 'PLAYER') {
  return TestBed.inject(HttpTestingController).expectOne((request) => {
    return (
      request.url === `http://api.test/${role === 'ADMIN' ? 'admin/' : ''}v1/matchdays` &&
      request.params.get('limit') === '100'
    );
  });
}

function expectSeasonPlayerScoresRequest(role: 'ADMIN' | 'PRESIDENT' | 'PLAYER', seasonId: string) {
  return TestBed.inject(HttpTestingController).expectOne(
    `http://api.test/${role === 'ADMIN' ? 'admin/' : ''}v1/season-player-scores?limit=200&seasonIds=${encodeURIComponent(
      JSON.stringify([seasonId]),
    )}`,
  );
}

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
    wonGames: 0,
    lostGames: 0,
    wonPairMatches: 0,
    lostPairMatches: 0,
    wonSets: 0,
    lostSets: 0,
    ...overrides,
  };
}
