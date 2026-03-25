import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficeLineupsRepository } from './http-backoffice-lineups.repository';

describe('HttpBackofficeLineupsRepository', () => {
  let repository: HttpBackofficeLineupsRepository;
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
        HttpBackofficeLineupsRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficeLineupsRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('uses /v1 for non-admin lineup reads', async () => {
    currentRole.set('PLAYER');

    const promise = repository.loadByMatchIds(['match-1']);

    httpTestingController
      .expectOne('http://api.test/v1/match-team-line-ups?limit=200&matchIds%5B%5D=match-1')
      .flush({ items: [createLineupHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toHaveLength(1);
  });

  it('uses /admin/v1 for admin lineup pair reads', async () => {
    currentRole.set('ADMIN');

    const promise = repository.loadPairsByLineupIds(['lineup-1']);

    httpTestingController
      .expectOne(
        'http://api.test/admin/v1/match-team-line-up-pairs?limit=200&matchTeamLineUpIds%5B%5D=lineup-1',
      )
      .flush({ items: [createPairHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ id: 'pair-1', lineupId: 'lineup-1' }),
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

function createLineupHttp() {
  return {
    id: 'lineup-1',
    matchId: 'match-1',
    teamId: 'team-1',
    status: 'pending',
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}

function createPairHttp() {
  return {
    id: 'pair-1',
    matchTeamLineUpId: 'lineup-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 120,
    wonGame: null,
    sets: [],
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}
