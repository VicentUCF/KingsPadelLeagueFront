import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

import { toBackofficeStandingsViewModel } from './backoffice-standings.viewmodel';

describe('toBackofficeStandingsViewModel', () => {
  it('calculates won and lost games from lineup sets and ranks by that difference', () => {
    const rows = toBackofficeStandingsViewModel(teams, matches, lineups, pairs);

    expect(rows).toEqual([
      expect.objectContaining({
        rank: 1,
        teamId: 'gamma',
        played: 1,
        won: 1,
        lost: 0,
        wonGames: 24,
        lostGames: 14,
        gamesDiff: 10,
        points: 3,
      }),
      expect.objectContaining({
        rank: 2,
        teamId: 'alpha',
        played: 1,
        won: 1,
        lost: 0,
        wonGames: 29,
        lostGames: 21,
        gamesDiff: 8,
        points: 3,
      }),
      expect.objectContaining({
        rank: 3,
        teamId: 'beta',
        played: 2,
        won: 0,
        lost: 2,
        wonGames: 35,
        lostGames: 53,
        gamesDiff: -18,
        points: 0,
      }),
    ]);
  });
});

const teams: readonly BackofficeTeam[] = [
  createTeam('alpha', 'Alpha'),
  createTeam('beta', 'Beta'),
  createTeam('gamma', 'Gamma'),
];

const matches: readonly BackofficeMatch[] = [
  {
    id: 'match-1',
    matchdayId: 'matchday-1',
    localTeamId: 'alpha',
    awayTeamId: 'beta',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-01T10:00:00.000Z'),
    status: 'finished',
    mvpId: null,
  },
  {
    id: 'match-2',
    matchdayId: 'matchday-2',
    localTeamId: 'gamma',
    awayTeamId: 'beta',
    localTeamScorePoints: 2,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-08T10:00:00.000Z'),
    status: 'finished',
    mvpId: null,
  },
];

const lineups: readonly BackofficeLineup[] = [
  createLineup('lineup-alpha', 'match-1', 'alpha'),
  createLineup('lineup-beta-1', 'match-1', 'beta'),
  createLineup('lineup-gamma', 'match-2', 'gamma'),
  createLineup('lineup-beta-2', 'match-2', 'beta'),
];

const pairs: readonly BackofficeLineupPair[] = [
  createPair('pair-alpha-1', 'lineup-alpha', true, [
    [6, 3],
    [6, 4],
  ]),
  createPair('pair-alpha-2', 'lineup-alpha', true, [
    [4, 6],
    [7, 5],
    [6, 3],
  ]),
  createPair('pair-beta-1', 'lineup-beta-1', false, [
    [3, 6],
    [4, 6],
  ]),
  createPair('pair-beta-2', 'lineup-beta-1', false, [
    [6, 4],
    [5, 7],
    [3, 6],
  ]),
  createPair('pair-gamma-1', 'lineup-gamma', true, [
    [6, 2],
    [6, 3],
  ]),
  createPair('pair-gamma-2', 'lineup-gamma', true, [
    [6, 4],
    [6, 5],
  ]),
  createPair('pair-beta-3', 'lineup-beta-2', false, [
    [2, 6],
    [3, 6],
  ]),
  createPair('pair-beta-4', 'lineup-beta-2', false, [
    [4, 6],
    [5, 6],
  ]),
];

function createTeam(id: string, name: string): BackofficeTeam {
  return {
    id,
    name,
    description: `${name} description`,
    secondaryDescription: `${name} secondary description`,
    logo: null,
  };
}

function createLineup(id: string, matchId: string, teamId: string): BackofficeLineup {
  return {
    id,
    matchId,
    teamId,
    status: 'submited',
  };
}

function createPair(
  id: string,
  lineupId: string,
  wonGame: boolean,
  sets: readonly (readonly [number, number])[],
): BackofficeLineupPair {
  return {
    id,
    lineupId,
    player1Id: `${id}-player-1`,
    player2Id: `${id}-player-2`,
    totalPlayersValue: 100,
    wonGame,
    sets: sets.map(([localScore, awayScore]) => ({
      localScore,
      awayScore,
    })),
  };
}
