import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

export type BackofficeFormResult = 'W' | 'D' | 'L';

export interface BackofficeStandingRow {
  readonly rank: number;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogo: string;
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly pointsFor: number;
  readonly pointsAgainst: number;
  readonly pointsDiff: number;
  readonly points: number;
  readonly form: readonly BackofficeFormResult[];
}

export function toBackofficeStandingsViewModel(
  teams: readonly BackofficeTeam[],
  matches: readonly BackofficeMatch[],
): readonly BackofficeStandingRow[] {
  interface TeamStats {
    won: number;
    drawn: number;
    lost: number;
    pointsFor: number;
    pointsAgainst: number;
    results: { scheduledAt: Date; result: BackofficeFormResult }[];
  }

  const stats = new Map<string, TeamStats>();
  for (const team of teams) {
    stats.set(team.id, {
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      results: [],
    });
  }

  const sorted = [...matches].sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());

  for (const match of sorted) {
    const local = stats.get(match.localTeamId);
    const away = stats.get(match.awayTeamId);
    if (!local || !away) continue;

    const ls = match.localTeamScorePoints;
    const as = match.awayTeamScorePoints;

    local.pointsFor += ls;
    local.pointsAgainst += as;
    away.pointsFor += as;
    away.pointsAgainst += ls;

    if (ls > as) {
      local.won++;
      local.results.push({ scheduledAt: match.scheduledAt, result: 'W' });
      away.lost++;
      away.results.push({ scheduledAt: match.scheduledAt, result: 'L' });
    } else if (as > ls) {
      away.won++;
      away.results.push({ scheduledAt: match.scheduledAt, result: 'W' });
      local.lost++;
      local.results.push({ scheduledAt: match.scheduledAt, result: 'L' });
    } else {
      local.drawn++;
      local.results.push({ scheduledAt: match.scheduledAt, result: 'D' });
      away.drawn++;
      away.results.push({ scheduledAt: match.scheduledAt, result: 'D' });
    }
  }

  const rows: BackofficeStandingRow[] = teams.map((team) => {
    const s = stats.get(team.id) ?? {
      won: 0,
      drawn: 0,
      lost: 0,
      pointsFor: 0,
      pointsAgainst: 0,
      results: [],
    };
    const played = s.won + s.drawn + s.lost;
    const points = s.won * 3 + s.drawn;
    const form = s.results.slice(-5).map((r) => r.result);

    return {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      played,
      won: s.won,
      drawn: s.drawn,
      lost: s.lost,
      pointsFor: s.pointsFor,
      pointsAgainst: s.pointsAgainst,
      pointsDiff: s.pointsFor - s.pointsAgainst,
      points,
      form,
    };
  });

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.pointsDiff !== a.pointsDiff) return b.pointsDiff - a.pointsDiff;
    if (b.pointsFor !== a.pointsFor) return b.pointsFor - a.pointsFor;
    return a.teamName.localeCompare(b.teamName, 'es');
  });

  return rows.map((row, index) => ({ ...row, rank: index + 1 }));
}
