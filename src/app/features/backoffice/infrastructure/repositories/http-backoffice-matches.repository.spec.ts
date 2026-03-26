import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficeMatchesRepository } from './http-backoffice-matches.repository';

describe('HttpBackofficeMatchesRepository', () => {
  let repository: HttpBackofficeMatchesRepository;
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
        HttpBackofficeMatchesRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficeMatchesRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('uses /v1 for non-admin reads', async () => {
    currentRole.set('PLAYER');

    const promise = repository.loadByMatchday('jornada-1');

    httpTestingController
      .expectOne(
        (req) =>
          req.urlWithParams ===
          'http://api.test/v1/matches?limit=100&matchdayIds=%5B%22jornada-1%22%5D',
      )
      .flush({ items: [createMatchHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ id: 'match-1', status: 'scheduled' }),
    ]);
  });

  it('uses /admin/v1 for admin reads', async () => {
    currentRole.set('ADMIN');

    const promise = repository.loadByTeam('team-1');

    httpTestingController
      .expectOne(
        (req) =>
          req.urlWithParams ===
          'http://api.test/admin/v1/matches?limit=100&localTeamIds=%5B%22team-1%22%5D&awayTeamIds=%5B%22team-1%22%5D',
      )
      .flush({ items: [createMatchHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toHaveLength(1);
  });

  it('posts admin mutations and omits null mvpId on create', async () => {
    const createPromise = repository.create({
      matchdayId: 'jornada-1',
      localTeamId: 'team-1',
      awayTeamId: 'team-2',
      scheduledAt: '2026-03-17T10:00:00.000Z',
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
      mvpId: null,
    });

    const createReq = httpTestingController.expectOne('http://api.test/admin/v1/matches');
    expect(createReq.request.body).toEqual({
      matchdayId: 'jornada-1',
      localTeamId: 'team-1',
      awayTeamId: 'team-2',
      scheduledAt: '2026-03-17T10:00:00.000Z',
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
    });
    createReq.flush(createMatchHttp());
    await expect(createPromise).resolves.toEqual(expect.objectContaining({ id: 'match-1' }));

    const startPromise = repository.start('match-1');
    httpTestingController.expectOne('http://api.test/admin/v1/matches/match-1/starts').flush({});
    await expect(startPromise).resolves.toBeUndefined();

    const finishPromise = repository.finish('match-1');
    httpTestingController.expectOne('http://api.test/admin/v1/matches/match-1/finishes').flush({});
    await expect(finishPromise).resolves.toBeUndefined();

    const updateMvpPromise = repository.updateMvp('match-1', 'player-9');
    const patchReq = httpTestingController.expectOne('http://api.test/admin/v1/matches/match-1');
    expect(patchReq.request.body).toEqual({ mvpId: 'player-9' });
    patchReq.flush({});
    await expect(updateMvpPromise).resolves.toBeUndefined();
  });
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

function createMatchHttp() {
  return {
    id: 'match-1',
    matchdayId: 'jornada-1',
    localTeamId: 'team-1',
    awayTeamId: 'team-2',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: '2026-03-17T10:00:00.000Z',
    status: 'scheduled',
    mvpId: null,
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}
