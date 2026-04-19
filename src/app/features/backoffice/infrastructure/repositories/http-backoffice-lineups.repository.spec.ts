import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { HttpBackofficeLineupsRepository } from './http-backoffice-lineups.repository';

describe('HttpBackofficeLineupsRepository', () => {
  let repository: HttpBackofficeLineupsRepository;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpBackofficeLineupsRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficeLineupsRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads lineups through the public endpoint', async () => {
    const promise = repository.loadByMatchIds(['match-1']);

    httpTestingController
      .expectOne('http://api.test/v1/match-team-line-ups?limit=200&matchIds=%5B%22match-1%22%5D')
      .flush({ items: [createLineupHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toHaveLength(1);
  });

  it('loads president lineups by match and team through the public endpoint', async () => {
    const promise = repository.loadByMatchIdsAndTeamIds(['match-1'], ['team-1']);

    httpTestingController
      .expectOne(
        'http://api.test/v1/match-team-line-ups?limit=200&matchIds=%5B%22match-1%22%5D&teamIds=%5B%22team-1%22%5D',
      )
      .flush({ items: [createLineupHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ id: 'lineup-1', matchId: 'match-1', teamId: 'team-1' }),
    ]);
  });

  it('loads lineup pairs through the public endpoint even for admin flows', async () => {
    const promise = repository.loadPairsByLineupIds(['lineup-1']);

    httpTestingController
      .expectOne(
        'http://api.test/v1/match-team-line-up-pairs?limit=200&sortBy=%5B%7B%22createdAt%22:%22ASC%22%7D%5D&matchTeamLineUpIds=%5B%22lineup-1%22%5D',
      )
      .flush({ items: [createPairHttp()], meta: createMeta(1) });

    await expect(promise).resolves.toEqual([
      expect.objectContaining({ id: 'pair-1', lineupId: 'lineup-1' }),
    ]);
  });

  it('finds one lineup by match and team including teamIds in the query', async () => {
    const promise = repository.findByMatchAndTeam('match-1', 'team-1');

    const request = httpTestingController.expectOne(
      'http://api.test/v1/match-team-line-ups?limit=200&matchIds=%5B%22match-1%22%5D&teamIds=%5B%22team-1%22%5D',
    );
    expect(request.request.method).toBe('GET');
    request.flush({
      items: [createLineupHttp({ id: 'lineup-2', teamId: 'team-2' }), createLineupHttp()],
      meta: createMeta(2),
    });

    await expect(promise).resolves.toEqual(
      expect.objectContaining({ id: 'lineup-1', matchId: 'match-1', teamId: 'team-1' }),
    );
  });

  it('creates a lineup through the admin endpoint', async () => {
    const promise = repository.create('match-1', 'team-1');

    const request = httpTestingController.expectOne('http://api.test/admin/v1/match-team-line-ups');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ matchId: 'match-1', teamId: 'team-1' });
    request.flush(createLineupHttp());

    await expect(promise).resolves.toEqual(
      expect.objectContaining({ id: 'lineup-1', matchId: 'match-1', teamId: 'team-1' }),
    );
  });

  it('updates a lineup pair allowing nullable slots', async () => {
    const promise = repository.updatePair('pair-1', 'player-1', null);

    const request = httpTestingController.expectOne(
      'http://api.test/v1/match-team-line-up-pairs/pair-1',
    );
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ player1Id: 'player-1', player2Id: null });
    request.flush(null);

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

function createLineupHttp(
  overrides: Partial<{
    id: string;
    matchId: string;
    teamId: string;
    status: 'pending' | 'submited';
    createdAt: string;
  }> = {},
) {
  return {
    id: 'lineup-1',
    matchId: 'match-1',
    teamId: 'team-1',
    status: 'pending',
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  } as const;
}

function createPairHttp() {
  return {
    id: 'pair-1',
    matchTeamLineUpId: 'lineup-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 120,
    createdAt: '2026-03-17T10:00:00.000Z',
  } as const;
}
