import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

import { toBackofficeStandingsViewModel } from './backoffice-standings.viewmodel';

describe('toBackofficeStandingsViewModel', () => {
  it('ranks teams from official season scores and keeps recent form from finished matches', () => {
    const rows = toBackofficeStandingsViewModel(teams, scores, matches);

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
        form: ['W'],
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
        form: ['W'],
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
        form: ['L', 'L'],
      }),
    ]);
  });
});

const teams: readonly BackofficeTeam[] = [
  createTeam('alpha', 'Alpha'),
  createTeam('beta', 'Beta'),
  createTeam('gamma', 'Gamma'),
];

const scores: readonly BackofficeSeasonTeamScore[] = [
  createScore('alpha', 3, 1, 0, 29, 21),
  createScore('beta', 0, 0, 2, 35, 53),
  createScore('gamma', 3, 1, 0, 24, 14),
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

function createTeam(id: string, name: string): BackofficeTeam {
  return {
    id,
    name,
    description: `${name} description`,
    secondaryDescription: `${name} secondary description`,
    logo: null,
  };
}

function createScore(
  teamId: string,
  totalPoints: number,
  wonMatches: number,
  lostMatches: number,
  wonGames: number,
  lostGames: number,
): BackofficeSeasonTeamScore {
  return {
    id: `score-${teamId}`,
    seasonId: 'season-1',
    teamId,
    totalPoints,
    wonMatches,
    lostMatches,
    wonGames,
    lostGames,
    wonSets: 0,
    lostSets: 0,
  };
}
