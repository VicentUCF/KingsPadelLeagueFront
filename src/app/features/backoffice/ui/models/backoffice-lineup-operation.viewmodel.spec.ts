import type { BackofficeLineup } from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import {
  createBackofficeLineupOperationViewModel,
  createBackofficeMatchdayOperationViewModel,
  createBackofficeMatchOperationViewModel,
} from './backoffice-lineup-operation.viewmodel';

function createPlayer(id: string, teamId = 'team-1', totalPoints = 0): BackofficePlayer {
  return {
    id,
    firstName: id,
    lastName: 'Player',
    email: `${id}@example.com`,
    teamId,
    isPresident: false,
    preferredPosition: 'both',
    profileImage: null,
    value: 10,
    totalPoints,
    wonGames: 0,
    lostGames: 0,
    description: '',
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

function createPairMatch(overrides: Partial<BackofficePairMatch> = {}): BackofficePairMatch {
  return {
    id: 'pair-match-1',
    localLineUpPairId: 'pair-1',
    awayLineUpPairId: 'pair-2',
    status: 'scheduled',
    setsResult: [],
    ...overrides,
  };
}

describe('backoffice-lineup-operation.viewmodel', () => {
  it('marks a pending lineup as ready only with exactly 2 complete and valid pairs', () => {
    const summary = createBackofficeLineupOperationViewModel({
      lineup: createLineup(),
      pairs: [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ],
      teamPlayers: [
        createPlayer('player-1'),
        createPlayer('player-2'),
        createPlayer('player-3'),
        createPlayer('player-4'),
      ],
    });

    expect(summary.lineupReadyForSubmit).toBe(true);
    expect(summary.lineupLocked).toBe(false);
    expect(summary.reasons).toEqual([]);
  });

  it('rejects duplicate and out-of-team players before submit', () => {
    const summary = createBackofficeLineupOperationViewModel({
      lineup: createLineup(),
      pairs: [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-1', player2Id: 'player-9' },
      ],
      teamPlayers: [
        createPlayer('player-1'),
        createPlayer('player-2'),
        createPlayer('player-3'),
        createPlayer('player-4'),
      ],
    });

    expect(summary.lineupReadyForSubmit).toBe(false);
    expect(summary.duplicatePlayerIds).toEqual(['player-1']);
    expect(summary.invalidPlayerIds).toEqual(['player-9']);
    expect(summary.reasons).toEqual(
      expect.arrayContaining([
        'Un jugador no puede repetirse en dos parejas.',
        'Todos los jugadores asignados deben pertenecer al equipo del presidente.',
      ]),
    );
  });

  it('blocks submit when pair two has more season points than pair one', () => {
    const summary = createBackofficeLineupOperationViewModel({
      lineup: createLineup(),
      pairs: [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ],
      teamPlayers: [
        createPlayer('player-1', 'team-1', 1),
        createPlayer('player-2', 'team-1', 2),
        createPlayer('player-3', 'team-1', 7),
        createPlayer('player-4', 'team-1', 5),
      ],
    });

    expect(summary.lineupReadyForSubmit).toBe(false);
    expect(summary.pairPointOrderValid).toBe(false);
    expect(summary.reasons).toContain(
      'La pareja 1 debe tener igual o más puntos de temporada que la pareja 2.',
    );
  });

  it('blocks pair generation when pair matches already exist', () => {
    const summary = createBackofficeMatchOperationViewModel({
      match: createMatch(),
      localLineup: createLineup({ id: 'lineup-local', status: 'submited' }),
      awayLineup: createLineup({
        id: 'lineup-away',
        teamId: 'team-2',
        status: 'submited',
      }),
      localPairs: [
        {
          id: 'local-pair-1',
          lineupId: 'lineup-local',
          player1Id: 'player-1',
          player2Id: 'player-2',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
        {
          id: 'local-pair-2',
          lineupId: 'lineup-local',
          player1Id: 'player-3',
          player2Id: 'player-4',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
      ],
      awayPairs: [
        {
          id: 'away-pair-1',
          lineupId: 'lineup-away',
          player1Id: 'player-5',
          player2Id: 'player-6',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
        {
          id: 'away-pair-2',
          lineupId: 'lineup-away',
          player1Id: 'player-7',
          player2Id: 'player-8',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
      ],
      localTeamPlayers: [
        createPlayer('player-1'),
        createPlayer('player-2'),
        createPlayer('player-3'),
        createPlayer('player-4'),
      ],
      awayTeamPlayers: [
        createPlayer('player-5', 'team-2'),
        createPlayer('player-6', 'team-2'),
        createPlayer('player-7', 'team-2'),
        createPlayer('player-8', 'team-2'),
      ],
      pairMatches: [
        createPairMatch({ id: 'pair-match-1' }),
        createPairMatch({ id: 'pair-match-2' }),
      ],
    });

    expect(summary.matchReadyForPairGeneration).toBe(false);
    expect(summary.pairGenerationReasons).toContain(
      'Los enfrentamientos de parejas ya se han generado y no se pueden volver a crear.',
    );
  });

  it('allows finishing a match only when it is in progress and both results exist', () => {
    const baseInput = {
      match: createMatch({ status: 'in_progress' }),
      localLineup: createLineup({ id: 'lineup-local', status: 'submited' }),
      awayLineup: createLineup({
        id: 'lineup-away',
        teamId: 'team-2',
        status: 'submited',
      }),
      localPairs: [
        {
          id: 'local-pair-1',
          lineupId: 'lineup-local',
          player1Id: 'player-1',
          player2Id: 'player-2',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
        {
          id: 'local-pair-2',
          lineupId: 'lineup-local',
          player1Id: 'player-3',
          player2Id: 'player-4',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
      ],
      awayPairs: [
        {
          id: 'away-pair-1',
          lineupId: 'lineup-away',
          player1Id: 'player-5',
          player2Id: 'player-6',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
        {
          id: 'away-pair-2',
          lineupId: 'lineup-away',
          player1Id: 'player-7',
          player2Id: 'player-8',
          totalPlayersValue: 0,
          wonGame: null,
          sets: [],
        },
      ],
      localTeamPlayers: [
        createPlayer('player-1'),
        createPlayer('player-2'),
        createPlayer('player-3'),
        createPlayer('player-4'),
      ],
      awayTeamPlayers: [
        createPlayer('player-5', 'team-2'),
        createPlayer('player-6', 'team-2'),
        createPlayer('player-7', 'team-2'),
        createPlayer('player-8', 'team-2'),
      ],
    };

    const completeSummary = createBackofficeMatchOperationViewModel({
      ...baseInput,
      pairMatches: [
        createPairMatch({
          id: 'pair-match-1',
          status: 'finished',
          setsResult: [{ local: 6, away: 4 }],
        }),
        createPairMatch({
          id: 'pair-match-2',
          localLineUpPairId: 'pair-3',
          awayLineUpPairId: 'pair-4',
          status: 'finished',
          setsResult: [{ local: 6, away: 2 }],
        }),
      ],
    });

    const incompleteSummary = createBackofficeMatchOperationViewModel({
      ...baseInput,
      pairMatches: [
        createPairMatch({
          id: 'pair-match-1',
          status: 'finished',
          setsResult: [{ local: 6, away: 4 }],
        }),
      ],
    });

    expect(completeSummary.matchReadyToFinish).toBe(true);
    expect(incompleteSummary.matchReadyToFinish).toBe(false);
    expect(incompleteSummary.finishReasons).toContain(
      'El partido debe tener exactamente 2 cruces generados antes de cerrarse.',
    );
  });

  it('blocks matchday closing while any match remains open', () => {
    const matchdaySummary = createBackofficeMatchdayOperationViewModel([
      createBackofficeMatchOperationViewModel({
        match: createMatch({ id: 'match-1', status: 'finished' }),
        localLineup: createLineup({ id: 'lineup-local', status: 'submited' }),
        awayLineup: createLineup({
          id: 'lineup-away',
          teamId: 'team-2',
          status: 'submited',
        }),
        localPairs: [],
        awayPairs: [],
        localTeamPlayers: [],
        awayTeamPlayers: [],
        pairMatches: [],
      }),
      createBackofficeMatchOperationViewModel({
        match: createMatch({ id: 'match-2', status: 'in_progress' }),
        localLineup: createLineup({ id: 'lineup-local-2', matchId: 'match-2', status: 'submited' }),
        awayLineup: createLineup({
          id: 'lineup-away-2',
          matchId: 'match-2',
          teamId: 'team-2',
          status: 'submited',
        }),
        localPairs: [],
        awayPairs: [],
        localTeamPlayers: [],
        awayTeamPlayers: [],
        pairMatches: [],
      }),
    ]);

    expect(matchdaySummary.matchdayReadyToFinish).toBe(false);
    expect(matchdaySummary.finishReasons).toEqual([
      'Finaliza todos los partidos antes de cerrar la jornada.',
    ]);
  });
});
