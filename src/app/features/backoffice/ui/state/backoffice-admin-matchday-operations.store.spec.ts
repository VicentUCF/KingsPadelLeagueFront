import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import { type BackofficeLineupsRepository } from '@features/backoffice/application/ports/backoffice-lineups.repository';
import {
  BACKOFFICE_MATCHES_REPOSITORY,
  type BackofficeMatchesRepository,
} from '@features/backoffice/application/ports/backoffice-matches.repository';
import {
  BACKOFFICE_PAIR_MATCHES_REPOSITORY,
  type BackofficePairMatchesRepository,
} from '@features/backoffice/application/ports/backoffice-pair-matches.repository';
import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import { BackofficeLineupsStore } from './backoffice-lineups.store';
import { BackofficeMatchdaysStore } from './backoffice-matchdays.store';
import { BackofficePlayersStore } from './backoffice-players.store';
import { BackofficeTeamsStore } from './backoffice-teams.store';
import { BackofficeAdminMatchdayOperationsStore } from './backoffice-admin-matchday-operations.store';

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((innerResolve, innerReject) => {
    resolve = innerResolve;
    reject = innerReject;
  });

  return { promise, resolve, reject };
}

describe('BackofficeAdminMatchdayOperationsStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('creates a matchday, refreshes the list and shows success feedback', async () => {
    const matchdaysRepository = {
      loadAll: jest.fn(),
      create: jest.fn().mockResolvedValue({
        id: 'matchday-9',
        name: 'Jornada 9',
        scheduledAt: '2026-04-01T18:00:00.000Z',
        seasonId: 'season-1',
        status: 'scheduled',
      }),
      start: jest.fn(),
      finish: jest.fn(),
      createPairMatches: jest.fn(),
    } satisfies BackofficeMatchdaysRepository;
    const toastStore = {
      success: jest.fn(),
      error: jest.fn(),
    } satisfies Pick<ActionToastStore, 'error' | 'success'>;

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: matchdaysRepository },
        { provide: LoadBackofficeLineupsUseCase, useValue: createLineupsRepositoryMock() },
        {
          provide: BACKOFFICE_MATCHES_REPOSITORY,
          useValue: createMatchesRepositoryMock(),
        },
        {
          provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY,
          useValue: createPairMatchesRepositoryMock(),
        },
        {
          provide: BackofficeMatchdaysStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: BackofficeLineupsStore, useValue: createLineupsStoreMock() },
        {
          provide: BackofficeTeamsStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: BackofficePlayersStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: ActionToastStore, useValue: toastStore },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);
    const matchdaysStore = TestBed.inject(BackofficeMatchdaysStore);

    await expect(
      store.createMatchday({
        name: 'Jornada 9',
        scheduledAt: '2026-04-01T18:00:00.000Z',
        seasonId: 'season-1',
      }),
    ).resolves.toBe('matchday-9');

    expect(matchdaysRepository.create).toHaveBeenCalledWith({
      name: 'Jornada 9',
      scheduledAt: '2026-04-01T18:00:00.000Z',
      seasonId: 'season-1',
    });
    expect(matchdaysStore.load).toHaveBeenCalledWith(true);
    expect(toastStore.success).toHaveBeenCalledWith(
      'La jornada se ha creado correctamente.',
      'Jornada creada',
    );
    expect(store.isCreatingMatchday()).toBe(false);
  });

  it('refreshes the full matchday context after finishing a pair match', async () => {
    const pairMatchesRepository = createPairMatchesRepositoryMock();
    pairMatchesRepository.finish.mockResolvedValue(undefined);
    pairMatchesRepository.loadByLineupPairIds.mockResolvedValue([
      {
        id: 'pair-match-1',
        localLineUpPairId: 'pair-1',
        awayLineUpPairId: 'pair-2',
        status: 'finished',
        setsResult: [{ local: 6, away: 4 }],
      },
    ]);
    const matchdaysStore = { load: jest.fn().mockResolvedValue(undefined) };
    const teamsStore = { load: jest.fn().mockResolvedValue(undefined) };
    const playersStore = { load: jest.fn().mockResolvedValue(undefined) };
    const lineupsStore = createLineupsStoreMock();
    const toastStore = {
      success: jest.fn(),
      error: jest.fn(),
    } satisfies Pick<ActionToastStore, 'error' | 'success'>;

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: createMatchdaysRepositoryMock() },
        { provide: LoadBackofficeLineupsUseCase, useValue: createLineupsRepositoryMock() },
        { provide: BACKOFFICE_MATCHES_REPOSITORY, useValue: createMatchesRepositoryMock() },
        { provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY, useValue: pairMatchesRepository },
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        { provide: BackofficeTeamsStore, useValue: teamsStore },
        { provide: BackofficePlayersStore, useValue: playersStore },
        { provide: ActionToastStore, useValue: toastStore },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);

    await store.finishPairMatch('matchday-1', 'pair-match-1', {
      setsResult: [{ local: 6, away: 4 }],
    });

    expect(pairMatchesRepository.finish).toHaveBeenCalledWith('pair-match-1', {
      setsResult: [{ local: 6, away: 4 }],
    });
    expect(matchdaysStore.load).toHaveBeenCalledWith(true);
    expect(teamsStore.load).toHaveBeenCalledWith(true);
    expect(playersStore.load).toHaveBeenCalledWith(true);
    expect(lineupsStore.loadForMatchday).toHaveBeenCalledWith('matchday-1', true);
    expect(pairMatchesRepository.loadByLineupPairIds).toHaveBeenCalledWith(['pair-1']);
    expect(store.pairMatches()).toEqual([
      expect.objectContaining({ id: 'pair-match-1', status: 'finished' }),
    ]);
    expect(toastStore.success).toHaveBeenCalledWith(
      'El resultado se ha guardado correctamente.',
      'Resultado registrado',
    );
  });

  it('tracks match action pending state while a match start is in flight', async () => {
    const deferred = createDeferred<void>();
    const matchesRepository = createMatchesRepositoryMock();
    matchesRepository.start.mockReturnValue(deferred.promise);

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: createMatchdaysRepositoryMock() },
        { provide: LoadBackofficeLineupsUseCase, useValue: createLineupsRepositoryMock() },
        { provide: BACKOFFICE_MATCHES_REPOSITORY, useValue: matchesRepository },
        {
          provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY,
          useValue: createPairMatchesRepositoryMock(),
        },
        {
          provide: BackofficeMatchdaysStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: BackofficeLineupsStore, useValue: createLineupsStoreMock() },
        {
          provide: BackofficeTeamsStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: BackofficePlayersStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);

    const promise = store.startMatch('matchday-1', 'match-1');

    expect(store.matchActionIds()).toEqual({ 'match-1': 'starting' });

    deferred.resolve();
    await promise;

    expect(store.matchActionIds()).toEqual({});
  });

  it('blocks duplicate encounters within the same matchday before calling the repository', async () => {
    const matchesRepository = createMatchesRepositoryMock();
    const toastStore = {
      success: jest.fn(),
      error: jest.fn(),
    } satisfies Pick<ActionToastStore, 'error' | 'success'>;

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: createMatchdaysRepositoryMock() },
        { provide: LoadBackofficeLineupsUseCase, useValue: createLineupsRepositoryMock() },
        { provide: BACKOFFICE_MATCHES_REPOSITORY, useValue: matchesRepository },
        {
          provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY,
          useValue: createPairMatchesRepositoryMock(),
        },
        {
          provide: BackofficeMatchdaysStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: BackofficeLineupsStore,
          useValue: createLineupsStoreMock([
            {
              id: 'match-1',
              matchdayId: 'matchday-1',
              localTeamId: 'team-1',
              awayTeamId: 'team-2',
              localTeamScorePoints: 0,
              awayTeamScorePoints: 0,
              scheduledAt: new Date('2026-03-25T18:00:00.000Z'),
              status: 'scheduled',
            },
          ]),
        },
        {
          provide: BackofficeTeamsStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: BackofficePlayersStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: ActionToastStore, useValue: toastStore },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);

    await expect(
      store.createMatch({
        matchdayId: 'matchday-1',
        localTeamId: 'team-2',
        awayTeamId: 'team-1',
        scheduledAt: '2026-03-25T18:00:00.000Z',
        localTeamScorePoints: 0,
        awayTeamScorePoints: 0,
      }),
    ).resolves.toBe(false);

    expect(matchesRepository.create).not.toHaveBeenCalled();
    expect(toastStore.error).toHaveBeenCalledWith(
      'Ese enfrentamiento ya existe en esta jornada.',
      'Partido duplicado',
    );
  });

  it('creates both team lineups after a successful match creation', async () => {
    const matchesRepository = createMatchesRepositoryMock();
    matchesRepository.create.mockResolvedValue(createBackofficeMatch());
    const lineupsRepository = createLineupsRepositoryMock();
    const matchdaysStore = { load: jest.fn().mockResolvedValue(undefined) };
    const teamsStore = { load: jest.fn().mockResolvedValue(undefined) };
    const playersStore = { load: jest.fn().mockResolvedValue(undefined) };
    const lineupsStore = createLineupsStoreMock();
    const toastStore = {
      success: jest.fn(),
      error: jest.fn(),
    } satisfies Pick<ActionToastStore, 'error' | 'success'>;

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: createMatchdaysRepositoryMock() },
        { provide: BACKOFFICE_MATCHES_REPOSITORY, useValue: matchesRepository },
        {
          provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY,
          useValue: createPairMatchesRepositoryMock(),
        },
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        { provide: BackofficeTeamsStore, useValue: teamsStore },
        { provide: BackofficePlayersStore, useValue: playersStore },
        { provide: ActionToastStore, useValue: toastStore },
        {
          provide: LoadBackofficeLineupsUseCase,
          useValue: lineupsRepository,
        },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);

    await expect(
      store.createMatch({
        matchdayId: 'matchday-1',
        localTeamId: 'team-1',
        awayTeamId: 'team-2',
        scheduledAt: '2026-03-25T18:00:00.000Z',
        localTeamScorePoints: 0,
        awayTeamScorePoints: 0,
      }),
    ).resolves.toBe(true);

    expect(matchesRepository.create).toHaveBeenCalled();
    expect(lineupsRepository.create).toHaveBeenNthCalledWith(1, 'match-1', 'team-1');
    expect(lineupsRepository.create).toHaveBeenNthCalledWith(2, 'match-1', 'team-2');
    expect(matchdaysStore.load).toHaveBeenCalledWith(true);
    expect(teamsStore.load).toHaveBeenCalledWith(true);
    expect(playersStore.load).toHaveBeenCalledWith(true);
    expect(lineupsStore.loadForMatchday).toHaveBeenCalledWith('matchday-1', true);
    expect(toastStore.success).toHaveBeenCalledWith(
      'El partido se ha creado correctamente.',
      'Partido creado',
    );
  });

  it('keeps the match created and shows a warning when lineup bootstrap fails', async () => {
    const matchesRepository = createMatchesRepositoryMock();
    matchesRepository.create.mockResolvedValue(createBackofficeMatch());
    const lineupsRepository = createLineupsRepositoryMock();
    lineupsRepository.create
      .mockResolvedValueOnce({
        id: 'lineup-1',
        matchId: 'match-1',
        teamId: 'team-1',
        status: 'pending',
      })
      .mockRejectedValueOnce(new Error('bootstrap_failed'));
    const toastStore = {
      success: jest.fn(),
      error: jest.fn(),
    } satisfies Pick<ActionToastStore, 'error' | 'success'>;

    TestBed.configureTestingModule({
      providers: [
        BackofficeAdminMatchdayOperationsStore,
        { provide: BackofficeMatchdaysRepository, useValue: createMatchdaysRepositoryMock() },
        { provide: BACKOFFICE_MATCHES_REPOSITORY, useValue: matchesRepository },
        {
          provide: BACKOFFICE_PAIR_MATCHES_REPOSITORY,
          useValue: createPairMatchesRepositoryMock(),
        },
        {
          provide: BackofficeMatchdaysStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: BackofficeLineupsStore, useValue: createLineupsStoreMock() },
        {
          provide: BackofficeTeamsStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        {
          provide: BackofficePlayersStore,
          useValue: { load: jest.fn().mockResolvedValue(undefined) },
        },
        { provide: ActionToastStore, useValue: toastStore },
        {
          provide: LoadBackofficeLineupsUseCase,
          useValue: lineupsRepository,
        },
      ],
    });

    const store = TestBed.inject(BackofficeAdminMatchdayOperationsStore);

    await expect(
      store.createMatch({
        matchdayId: 'matchday-1',
        localTeamId: 'team-1',
        awayTeamId: 'team-2',
        scheduledAt: '2026-03-25T18:00:00.000Z',
        localTeamScorePoints: 0,
        awayTeamScorePoints: 0,
      }),
    ).resolves.toBe(true);

    expect(toastStore.error).toHaveBeenCalledWith(
      'El partido se ha creado, pero no hemos podido preparar las alineaciones automáticamente.',
      'Revisión pendiente',
    );
    expect(toastStore.success).not.toHaveBeenCalled();
  });
});

function createLineupsRepositoryMock() {
  return {
    create: jest.fn().mockResolvedValue({
      id: 'lineup-1',
      matchId: 'match-1',
      teamId: 'team-1',
      status: 'pending',
    }),
  } as {
    create: jest.MockedFunction<BackofficeLineupsRepository['create']>;
  };
}

function createMatchdaysRepositoryMock() {
  return {
    loadAll: jest.fn(),
    create: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    finish: jest.fn().mockResolvedValue(undefined),
    createPairMatches: jest.fn().mockResolvedValue(undefined),
  } satisfies BackofficeMatchdaysRepository;
}

function createBackofficeMatch(overrides: Partial<BackofficeMatch> = {}): BackofficeMatch {
  return {
    id: 'match-1',
    matchdayId: 'matchday-1',
    localTeamId: 'team-1',
    awayTeamId: 'team-2',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-25T18:00:00.000Z'),
    status: 'scheduled',
    ...overrides,
  };
}

function createMatchesRepositoryMock() {
  return {
    loadByMatchday: jest.fn(),
    loadByTeam: jest.fn(),
    create: jest.fn(),
    start: jest.fn().mockResolvedValue(undefined),
    finish: jest.fn().mockResolvedValue(undefined),
  } satisfies BackofficeMatchesRepository;
}

function createPairMatchesRepositoryMock() {
  return {
    loadByLineupPairIds: jest.fn().mockResolvedValue([]),
    finish: jest.fn().mockResolvedValue(undefined),
  } satisfies BackofficePairMatchesRepository;
}

function createLineupsStoreMock(matches: readonly BackofficeMatch[] = []) {
  return {
    matches: signal(matches),
    pairs: signal([
      {
        id: 'pair-1',
        lineupId: 'lineup-1',
        player1Id: 'player-1',
        player2Id: 'player-2',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
    ]),
    loadForMatchday: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<BackofficeLineupsStore, 'loadForMatchday' | 'matches' | 'pairs'>;
}
