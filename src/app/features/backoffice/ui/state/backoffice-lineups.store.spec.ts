import { TestBed } from '@angular/core/testing';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
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

function createLineup(overrides: Partial<BackofficeLineup> = {}): BackofficeLineup {
  return {
    id: 'lineup-1',
    matchId: 'match-1',
    teamId: 'team-1',
    status: 'pending',
    ...overrides,
  };
}

function createPair(overrides: Partial<BackofficeLineupPair> = {}): BackofficeLineupPair {
  return {
    id: 'pair-1',
    lineupId: 'lineup-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [],
    ...overrides,
  };
}

function createLineupsUseCaseMock() {
  return {
    byMatchIds: jest.fn(),
    byMatchIdsAndTeamIds: jest.fn(),
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
    byMatchdayAndTeam: jest.fn(),
    byTeam: jest.fn(),
  };
}

describe('BackofficeLineupsStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('loads president data by matchday and team using the narrowed queries', async () => {
    const matchesUseCase = createMatchesUseCaseMock();
    const lineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch();
    const lineup = createLineup();
    const pair = createPair();

    matchesUseCase.byMatchdayAndTeam.mockResolvedValue([match]);
    lineupsUseCase.byMatchIdsAndTeamIds.mockResolvedValue([lineup]);
    lineupsUseCase.pairsByLineupIds.mockResolvedValue([pair]);

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: matchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: lineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForMatchdayAndTeam('matchday-1', 'team-1');

    expect(matchesUseCase.byMatchdayAndTeam).toHaveBeenCalledWith('matchday-1', 'team-1');
    expect(lineupsUseCase.byMatchIdsAndTeamIds).toHaveBeenCalledWith(['match-1'], ['team-1']);
    expect(lineupsUseCase.pairsByLineupIds).toHaveBeenCalledWith(['lineup-1']);
    expect(store.matches()).toEqual([match]);
    expect(store.lineups()).toEqual([lineup]);
    expect(store.pairs()).toEqual([pair]);
    expect(store.hasContent()).toBe(true);
  });

  it('updates existing pairs and refreshes the current matchday-team context after submit', async () => {
    const matchesUseCase = createMatchesUseCaseMock();
    const lineupsUseCase = createLineupsUseCaseMock();
    const match = createMatch();
    const lineup = createLineup();
    const existingPairs = [
      createPair({ id: 'pair-1', player1Id: 'player-1', player2Id: 'player-2' }),
      createPair({
        id: 'pair-2',
        player1Id: 'player-3',
        player2Id: 'player-4',
      }),
    ];
    const refreshedPairs = [
      createPair({ id: 'pair-1', player1Id: 'player-5', player2Id: 'player-6' }),
      createPair({
        id: 'pair-2',
        player1Id: 'player-7',
        player2Id: 'player-8',
      }),
    ];

    matchesUseCase.byMatchdayAndTeam.mockResolvedValue([match]);
    lineupsUseCase.byMatchIdsAndTeamIds.mockResolvedValue([lineup]);
    lineupsUseCase.findByMatchAndTeam.mockResolvedValue(lineup);
    lineupsUseCase.pairsByLineupIds
      .mockResolvedValueOnce(existingPairs)
      .mockResolvedValueOnce(existingPairs)
      .mockResolvedValueOnce(refreshedPairs);
    lineupsUseCase.updatePair.mockResolvedValue(undefined);
    lineupsUseCase.submit.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: matchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: lineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await store.loadForMatchdayAndTeam('matchday-1', 'team-1');
    await store.submitDraft('match-1', 'team-1', [
      { player1Id: 'player-5', player2Id: 'player-6' },
      { player1Id: 'player-7', player2Id: 'player-8' },
    ]);

    expect(lineupsUseCase.findByMatchAndTeam).toHaveBeenCalledWith('match-1', 'team-1');
    expect(lineupsUseCase.updatePair).toHaveBeenNthCalledWith(1, 'pair-1', 'player-5', 'player-6');
    expect(lineupsUseCase.updatePair).toHaveBeenNthCalledWith(2, 'pair-2', 'player-7', 'player-8');
    expect(lineupsUseCase.createPair).not.toHaveBeenCalled();
    expect(lineupsUseCase.submit).toHaveBeenCalledWith('lineup-1');
    expect(matchesUseCase.byMatchdayAndTeam).toHaveBeenCalledTimes(2);
    expect(store.pairs()).toEqual(refreshedPairs);
    expect(store.isSubmittingLineup()).toBe(false);
  });

  it('rejects incomplete drafts before calling lineup mutations', async () => {
    const matchesUseCase = createMatchesUseCaseMock();
    const lineupsUseCase = createLineupsUseCaseMock();

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: matchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: lineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await expect(
      store.submitDraft('match-1', 'team-1', [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: null },
      ]),
    ).rejects.toThrow('invalid_lineup_draft');

    expect(lineupsUseCase.findByMatchAndTeam).not.toHaveBeenCalled();
    expect(lineupsUseCase.createPair).not.toHaveBeenCalled();
    expect(lineupsUseCase.updatePair).not.toHaveBeenCalled();
  });

  it('blocks pair creation and edition when the lineup is already submitted', async () => {
    const matchesUseCase = createMatchesUseCaseMock();
    const lineupsUseCase = createLineupsUseCaseMock();

    lineupsUseCase.findByMatchAndTeam.mockResolvedValue(createLineup({ status: 'submited' }));

    TestBed.configureTestingModule({
      providers: [
        BackofficeLineupsStore,
        { provide: LoadBackofficeMatchesUseCase, useValue: matchesUseCase },
        { provide: LoadBackofficeLineupsUseCase, useValue: lineupsUseCase },
      ],
    });

    const store = TestBed.inject(BackofficeLineupsStore);

    await expect(
      store.submitDraft('match-1', 'team-1', [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ]),
    ).rejects.toThrow('lineup_locked');

    expect(lineupsUseCase.createPair).not.toHaveBeenCalled();
    expect(lineupsUseCase.updatePair).not.toHaveBeenCalled();
    expect(lineupsUseCase.submit).not.toHaveBeenCalled();
  });
});
