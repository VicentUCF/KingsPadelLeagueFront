import { TestBed } from '@angular/core/testing';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type { BackofficeLineup } from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import { BackofficeLineupsStore } from './backoffice-lineups.store';

function createMatch(overrides: Partial<BackofficeMatch> = {}): BackofficeMatch {
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

function createPair(
  overrides: Partial<{
    id: string;
    lineupId: string;
    player1Id: string | null;
    player2Id: string | null;
    totalPlayersValue: number;
    wonGame: null;
    sets: readonly [];
  }> = {},
) {
  return {
    id: 'pair-1',
    lineupId: 'lineup-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [] as const,
    ...overrides,
  };
}

function createLineup(overrides: Partial<BackofficeLineup> = {}): BackofficeLineup {
  return {
    id: 'lineup-1',
    matchId: 'match-1',
    teamId: 'team-1',
    status: 'pending',
    ...overrides,
  };
}

function createLineupsUseCaseMock() {
  return {
    byMatchIds: jest.fn(),
    findByMatchAndTeam: jest.fn(),
    pairsByLineupIds: jest.fn(),
    create: jest.fn(),
    createPair: jest.fn(),
    updatePair: jest.fn(),
    submit: jest.fn(),
  };
}

function createMatchesUseCaseMock() {
  return {
    byMatchday: jest.fn(),
    byTeam: jest.fn(),
  };
}

describe('BackofficeLineupsStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('refreshes the lineup from the server before submitting and persists complete pairs', async () => {
    const loadBackofficeMatchesUseCase = createMatchesUseCaseMock();
    const loadBackofficeLineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch();
    const lineup = createLineup();

    loadBackofficeMatchesUseCase.byTeam.mockResolvedValue([match]);
    loadBackofficeLineupsUseCase.byMatchIds.mockResolvedValue([lineup]);
    loadBackofficeLineupsUseCase.findByMatchAndTeam.mockResolvedValue(lineup);
    loadBackofficeLineupsUseCase.pairsByLineupIds
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([createPair()]);
    loadBackofficeLineupsUseCase.createPair.mockResolvedValue({
      id: 'pair-1',
      lineupId: 'lineup-1',
      player1Id: 'player-1',
      player2Id: 'player-2',
      totalPlayersValue: 100,
      wonGame: null,
      sets: [],
    });

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: loadBackofficeMatchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: loadBackofficeLineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForTeam('team-1');
    loadBackofficeLineupsUseCase.submit.mockResolvedValue(undefined);

    await store.submitDraft('match-1', 'team-1', [
      { player1Id: 'player-1', player2Id: 'player-2' },
      { player1Id: 'player-3', player2Id: null },
    ]);

    expect(loadBackofficeLineupsUseCase.findByMatchAndTeam).toHaveBeenCalledWith(
      'match-1',
      'team-1',
    );
    expect(loadBackofficeLineupsUseCase.create).not.toHaveBeenCalled();
    expect(loadBackofficeLineupsUseCase.createPair).toHaveBeenCalledTimes(1);
    expect(loadBackofficeLineupsUseCase.createPair).toHaveBeenCalledWith(
      'lineup-1',
      'player-1',
      'player-2',
    );
    expect(loadBackofficeMatchesUseCase.byTeam).toHaveBeenCalledTimes(2);
    expect(store.lineups()).toEqual([lineup]);
    expect(store.pairs()).toEqual([
      expect.objectContaining({ id: 'pair-1', lineupId: 'lineup-1' }),
    ]);
    expect(store.isSubmittingLineup()).toBe(false);
  });

  it('updates existing lineup pairs and refreshes the current team context', async () => {
    const loadBackofficeMatchesUseCase = createMatchesUseCaseMock();
    const loadBackofficeLineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch({ matchdayId: 'matchday-2' });
    const lineup = createLineup();
    const existingPairs = [
      {
        id: 'pair-1',
        lineupId: 'lineup-1',
        player1Id: 'player-1',
        player2Id: 'player-2',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
      {
        id: 'pair-2',
        lineupId: 'lineup-1',
        player1Id: 'player-3',
        player2Id: 'player-4',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
    ];
    const refreshedPairs = [
      {
        id: 'pair-1',
        lineupId: 'lineup-1',
        player1Id: 'player-5',
        player2Id: 'player-6',
        totalPlayersValue: 120,
        wonGame: null,
        sets: [],
      },
      {
        id: 'pair-2',
        lineupId: 'lineup-1',
        player1Id: null,
        player2Id: null,
        totalPlayersValue: 0,
        wonGame: null,
        sets: [],
      },
    ];

    loadBackofficeMatchesUseCase.byTeam.mockResolvedValue([match]);
    loadBackofficeLineupsUseCase.byMatchIds.mockResolvedValue([lineup]);
    loadBackofficeLineupsUseCase.findByMatchAndTeam.mockResolvedValue(lineup);
    loadBackofficeLineupsUseCase.pairsByLineupIds
      .mockResolvedValueOnce(existingPairs)
      .mockResolvedValueOnce(existingPairs)
      .mockResolvedValueOnce(refreshedPairs);
    loadBackofficeLineupsUseCase.updatePair.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: loadBackofficeMatchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: loadBackofficeLineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForTeam('team-1');
    loadBackofficeLineupsUseCase.submit.mockResolvedValue(undefined);

    await store.submitDraft('match-1', 'team-1', [
      { player1Id: 'player-5', player2Id: 'player-6' },
      { player1Id: null, player2Id: null },
    ]);

    expect(loadBackofficeLineupsUseCase.create).not.toHaveBeenCalled();
    expect(loadBackofficeLineupsUseCase.createPair).not.toHaveBeenCalled();
    expect(loadBackofficeLineupsUseCase.findByMatchAndTeam).toHaveBeenCalledWith(
      'match-1',
      'team-1',
    );
    expect(loadBackofficeLineupsUseCase.updatePair).toHaveBeenNthCalledWith(
      1,
      'pair-1',
      'player-5',
      'player-6',
    );
    expect(loadBackofficeLineupsUseCase.updatePair).toHaveBeenNthCalledWith(
      2,
      'pair-2',
      null,
      null,
    );
    expect(loadBackofficeMatchesUseCase.byTeam).toHaveBeenCalledTimes(2);
    expect(store.pairs()).toEqual(refreshedPairs);
    expect(store.isSubmittingLineup()).toBe(false);
  });

  it('refreshes the lineup from the server before submitting', async () => {
    const loadBackofficeMatchesUseCase = createMatchesUseCaseMock();
    const loadBackofficeLineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch();
    const lineup = createLineup();
    const refreshedPairs = [
      {
        id: 'pair-1',
        lineupId: 'lineup-1',
        player1Id: 'player-1',
        player2Id: 'player-2',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
    ];

    loadBackofficeMatchesUseCase.byTeam.mockResolvedValue([match]);
    loadBackofficeLineupsUseCase.byMatchIds.mockResolvedValue([lineup]);
    loadBackofficeLineupsUseCase.findByMatchAndTeam.mockResolvedValue(lineup);
    loadBackofficeLineupsUseCase.pairsByLineupIds
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(refreshedPairs);
    loadBackofficeLineupsUseCase.createPair.mockResolvedValue(refreshedPairs[0]);
    loadBackofficeLineupsUseCase.submit.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: loadBackofficeMatchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: loadBackofficeLineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForTeam('team-1');
    await store.submitDraft('match-1', 'team-1', [
      { player1Id: 'player-1', player2Id: 'player-2' },
    ]);

    expect(loadBackofficeLineupsUseCase.findByMatchAndTeam).toHaveBeenCalledWith(
      'match-1',
      'team-1',
    );
    expect(loadBackofficeLineupsUseCase.create).not.toHaveBeenCalled();
    expect(loadBackofficeLineupsUseCase.createPair).toHaveBeenCalledWith(
      'lineup-1',
      'player-1',
      'player-2',
    );
    expect(loadBackofficeLineupsUseCase.submit).toHaveBeenCalledWith('lineup-1');
    expect(loadBackofficeMatchesUseCase.byTeam).toHaveBeenCalledTimes(2);
    expect(store.isSubmittingLineup()).toBe(false);
  });

  it('fails with lineup_not_initialized when the preflight lookup does not find any lineup', async () => {
    const loadBackofficeMatchesUseCase = createMatchesUseCaseMock();
    const loadBackofficeLineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch();

    loadBackofficeMatchesUseCase.byTeam.mockResolvedValue([match]);
    loadBackofficeLineupsUseCase.byMatchIds.mockResolvedValue([]);
    loadBackofficeLineupsUseCase.findByMatchAndTeam.mockResolvedValue(null);

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: loadBackofficeMatchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: loadBackofficeLineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForTeam('team-1');

    await expect(
      store.submitDraft('match-1', 'team-1', [{ player1Id: 'player-1', player2Id: 'player-2' }]),
    ).rejects.toThrow('lineup_not_initialized');

    expect(loadBackofficeLineupsUseCase.create).not.toHaveBeenCalled();
    expect(loadBackofficeLineupsUseCase.createPair).not.toHaveBeenCalled();
    expect(store.isSubmittingLineup()).toBe(false);
  });
});
