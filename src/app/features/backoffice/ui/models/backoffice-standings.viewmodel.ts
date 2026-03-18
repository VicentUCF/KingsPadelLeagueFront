import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';

export type BackofficeFormResult = 'W' | 'D' | 'L';

export interface BackofficeStandingRow {
  readonly rank: number;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogo: string | null;
  readonly played: number;
  readonly won: number;
  readonly lost: number;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly gamesDiff: number;
  readonly points: number;
  readonly form: readonly BackofficeFormResult[];
}

export function toBackofficeStandingsViewModel(
  teams: readonly BackofficeTeam[],
  matches: readonly BackofficeMatch[],
  lineups: readonly BackofficeLineup[],
  pairs: readonly BackofficeLineupPair[],
): readonly BackofficeStandingRow[] {
  interface TeamStats {
    won: number;
    lost: number;
    wonGames: number;
    lostGames: number;
    results: { scheduledAt: Date; result: BackofficeFormResult }[];
  }

  const lineupByMatchTeamKey = new Map(
    lineups.map((lineup) => [createMatchTeamKey(lineup.matchId, lineup.teamId), lineup]),
  );
  const pairsByLineupId = groupPairsByLineupId(pairs);
  const stats = new Map<string, TeamStats>();

  for (const team of teams) {
    stats.set(team.id, {
      won: 0,
      lost: 0,
      wonGames: 0,
      lostGames: 0,
      results: [],
    });
  }

  const sorted = [...matches].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  for (const match of sorted) {
    const local = stats.get(match.localTeamId);
    const away = stats.get(match.awayTeamId);
    if (!local || !away) continue;

    const localLineup = lineupByMatchTeamKey.get(createMatchTeamKey(match.id, match.localTeamId));
    const awayLineup = lineupByMatchTeamKey.get(createMatchTeamKey(match.id, match.awayTeamId));
    const localGames = sumLineupGames(
      localLineup ? (pairsByLineupId.get(localLineup.id) ?? []) : [],
    );
    const awayGames = sumLineupGames(awayLineup ? (pairsByLineupId.get(awayLineup.id) ?? []) : []);

    local.wonGames += localGames.won;
    local.lostGames += localGames.lost;
    away.wonGames += awayGames.won;
    away.lostGames += awayGames.lost;

    if (match.localTeamScorePoints > match.awayTeamScorePoints) {
      local.won++;
      local.results.push({ scheduledAt: match.scheduledAt, result: 'W' });
      away.lost++;
      away.results.push({ scheduledAt: match.scheduledAt, result: 'L' });
    } else if (match.awayTeamScorePoints > match.localTeamScorePoints) {
      away.won++;
      away.results.push({ scheduledAt: match.scheduledAt, result: 'W' });
      local.lost++;
      local.results.push({ scheduledAt: match.scheduledAt, result: 'L' });
    }
  }

  const rows: BackofficeStandingRow[] = teams.map((team) => {
    const s = stats.get(team.id) ?? {
      won: 0,
      lost: 0,
      wonGames: 0,
      lostGames: 0,
      results: [],
    };
    const played = s.won + s.lost;
    const points = s.won * 3;
    const form = s.results.slice(-5).map((r) => r.result);

    return {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      played,
      won: s.won,
      lost: s.lost,
      wonGames: s.wonGames,
      lostGames: s.lostGames,
      gamesDiff: s.wonGames - s.lostGames,
      points,
      form,
    };
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gamesDiff !== a.gamesDiff) return b.gamesDiff - a.gamesDiff;
    if (b.wonGames !== a.wonGames) return b.wonGames - a.wonGames;
    return a.teamName.localeCompare(b.teamName, 'es');
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}

function createMatchTeamKey(matchId: string, teamId: string): string {
  return `${matchId}:${teamId}`;
}

function groupPairsByLineupId(
  pairs: readonly BackofficeLineupPair[],
): ReadonlyMap<string, readonly BackofficeLineupPair[]> {
  const pairsByLineupId = new Map<string, BackofficeLineupPair[]>();

  for (const pair of pairs) {
    const lineupPairs = pairsByLineupId.get(pair.lineupId);
    if (lineupPairs) {
      lineupPairs.push(pair);
      continue;
    }

    pairsByLineupId.set(pair.lineupId, [pair]);
  }

  return pairsByLineupId;
}

function sumLineupGames(pairs: readonly BackofficeLineupPair[]): {
  readonly won: number;
  readonly lost: number;
} {
  return pairs.reduce(
    (totals, pair) => ({
      won:
        totals.won +
        pair.sets.reduce((sum, setResult) => {
          return sum + setResult.localScore;
        }, 0),
      lost:
        totals.lost +
        pair.sets.reduce((sum, setResult) => {
          return sum + setResult.awayScore;
        }, 0),
    }),
    { won: 0, lost: 0 },
  );
}
