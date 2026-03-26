import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficeSeasonTeamScoresRepository } from './http-backoffice-season-team-scores.repository';

describe('HttpBackofficeSeasonTeamScoresRepository', () => {
  let repository: HttpBackofficeSeasonTeamScoresRepository;
  let httpTestingController: HttpTestingController;
  let currentRole: ReturnType<typeof signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>>;

  beforeEach(() => {
    currentRole = signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>('ADMIN');

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
        HttpBackofficeSeasonTeamScoresRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficeSeasonTeamScoresRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads official season team scores using JSON-stringified filters', async () => {
    const promise = repository.loadBySeasonId('season-2026');

    httpTestingController
      .expectOne(
        'http://api.test/admin/v1/season-team-scores?limit=50&seasonIds=%5B%22season-2026%22%5D',
      )
      .flush({
        items: [
          {
            id: 'score-1',
            seasonId: 'season-2026',
            teamId: 'team-1',
            totalPoints: 9,
            wonMatches: 3,
            lostMatches: 0,
            wonGames: 18,
            lostGames: 8,
            wonSets: 6,
            lostSets: 2,
            createdAt: '2026-03-17T10:00:00.000Z',
          },
        ],
        meta: createMeta(1),
      });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({
        teamId: 'team-1',
        totalPoints: 9,
        wonMatches: 3,
        lostMatches: 0,
      }),
    ]);
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
