import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficeMatchdaysRepository } from './http-backoffice-matchdays.repository';

describe('HttpBackofficeMatchdaysRepository', () => {
  let repository: HttpBackofficeMatchdaysRepository;
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
        HttpBackofficeMatchdaysRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficeMatchdaysRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('uses /v1 for non-admin matchday reads', async () => {
    currentRole.set('PLAYER');

    const promise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/v1/matchdays?limit=100').flush({
      items: [createMatchdayHttp()],
      meta: createMeta(1),
    });

    await expect(promise).resolves.toHaveLength(1);
  });

  it('uses /admin/v1 for admin matchday reads', async () => {
    currentRole.set('ADMIN');

    const promise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/admin/v1/matchdays?limit=100').flush({
      items: [createMatchdayHttp()],
      meta: createMeta(1),
    });

    await expect(promise).resolves.toHaveLength(1);
  });

  it('posts admin create/start/finish and pair-match generation actions', async () => {
    const createPromise = repository.create({
      name: 'Jornada 9',
      scheduledAt: '2026-04-01T18:00:00.000Z',
      seasonId: 'season-2026',
    });

    httpTestingController
      .expectOne('http://api.test/admin/v1/matchdays')
      .flush(createMatchdayHttp());
    await expect(createPromise).resolves.toEqual(expect.objectContaining({ id: 'jornada-1' }));

    const startPromise = repository.start('jornada-1');
    httpTestingController
      .expectOne('http://api.test/admin/v1/matchdays/jornada-1/starts')
      .flush({});
    await expect(startPromise).resolves.toBeUndefined();

    const finishPromise = repository.finish('jornada-1');
    httpTestingController
      .expectOne('http://api.test/admin/v1/matchdays/jornada-1/finishes')
      .flush({});
    await expect(finishPromise).resolves.toBeUndefined();

    const pairMatchesPromise = repository.createPairMatches('jornada-1');
    httpTestingController
      .expectOne('http://api.test/admin/v1/matchdays/jornada-1/create-pair-matches')
      .flush({});
    await expect(pairMatchesPromise).resolves.toBeUndefined();
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

function createMatchdayHttp() {
  return {
    id: 'jornada-1',
    name: 'Jornada 1',
    scheduledAt: '2026-03-17T10:00:00.000Z',
    seasonId: 'season-2026',
    status: 'scheduled',
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}
