import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';

import { HttpBackofficePairMatchesRepository } from './http-backoffice-pair-matches.repository';

describe('HttpBackofficePairMatchesRepository', () => {
  let repository: HttpBackofficePairMatchesRepository;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpBackofficePairMatchesRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficePairMatchesRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads pair matches and maps status and sets result', async () => {
    const promise = repository.loadByLineupPairIds(['lineup-pair-1']);

    httpTestingController
      .expectOne(
        'http://api.test/v1/pair-matches?limit=200&localLineUpPairIds=%5B%22lineup-pair-1%22%5D&awayLineUpPairIds=%5B%22lineup-pair-1%22%5D',
      )
      .flush({ items: [createPairMatchHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toEqual([
      {
        id: 'pair-match-1',
        localLineUpPairId: 'lineup-pair-1',
        awayLineUpPairId: 'lineup-pair-2',
        status: 'finished',
        setsResult: [
          { local: 6, away: 4 },
          { local: 4, away: 6 },
          { local: 6, away: 3 },
        ],
      },
    ]);
  });

  it('posts finish payload to the admin endpoint', async () => {
    const promise = repository.finish('pair-match-1', {
      setsResult: [
        { local: 6, away: 4 },
        { local: 6, away: 2 },
      ],
    });

    const req = httpTestingController.expectOne(
      'http://api.test/admin/v1/pair-matches/pair-match-1/finishes',
    );
    expect(req.request.body).toEqual({
      setsResult: [
        { local: 6, away: 4 },
        { local: 6, away: 2 },
      ],
    });
    req.flush({});

    await expect(promise).resolves.toBeUndefined();
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

function createPairMatchHttp() {
  return {
    id: 'pair-match-1',
    localLineUpPairId: 'lineup-pair-1',
    awayLineUpPairId: 'lineup-pair-2',
    status: 'finished',
    order: 1,
    setsResult: [
      { local: 6, away: 4 },
      { local: 4, away: 6 },
      { local: 6, away: 3 },
    ],
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}
