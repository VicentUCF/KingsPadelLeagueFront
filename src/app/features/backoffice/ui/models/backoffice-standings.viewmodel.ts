import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';

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
  scores: readonly BackofficeSeasonTeamScore[],
  matches: readonly BackofficeMatch[],
): readonly BackofficeStandingRow[] {
  const scoresByTeamId = new Map(scores.map((score) => [score.teamId, score]));
  const resultsByTeamId = buildRecentResultsByTeamId(matches);

  const rows: BackofficeStandingRow[] = teams.map((team) => {
    const score = scoresByTeamId.get(team.id);
    const won = score?.wonMatches ?? 0;
    const lost = score?.lostMatches ?? 0;
    const wonGames = score?.wonGames ?? 0;
    const lostGames = score?.lostGames ?? 0;
    const points = score?.totalPoints ?? 0;
    const form = resultsByTeamId.get(team.id) ?? [];

    return {
      rank: 0,
      teamId: team.id,
      teamName: team.name,
      teamLogo: team.logo,
      played: won + lost,
      won,
      lost,
      wonGames,
      lostGames,
      gamesDiff: wonGames - lostGames,
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

function buildRecentResultsByTeamId(
  matches: readonly BackofficeMatch[],
): ReadonlyMap<string, readonly BackofficeFormResult[]> {
  const resultsByTeamId = new Map<string, { scheduledAt: Date; result: BackofficeFormResult }[]>();

  const sortedMatches = [...matches]
    .filter((match) => match.status === 'finished')
    .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime());

  for (const match of sortedMatches) {
    if (match.localTeamScorePoints === match.awayTeamScorePoints) {
      continue;
    }

    pushTeamResult(
      resultsByTeamId,
      match.localTeamId,
      match.scheduledAt,
      match.localTeamScorePoints > match.awayTeamScorePoints ? 'W' : 'L',
    );
    pushTeamResult(
      resultsByTeamId,
      match.awayTeamId,
      match.scheduledAt,
      match.awayTeamScorePoints > match.localTeamScorePoints ? 'W' : 'L',
    );
  }

  return new Map(
    [...resultsByTeamId.entries()].map(([teamId, results]) => [
      teamId,
      results
        .sort((left, right) => left.scheduledAt.getTime() - right.scheduledAt.getTime())
        .slice(-5)
        .map((entry) => entry.result),
    ]),
  );
}

function pushTeamResult(
  resultsByTeamId: Map<string, { scheduledAt: Date; result: BackofficeFormResult }[]>,
  teamId: string,
  scheduledAt: Date,
  result: BackofficeFormResult,
): void {
  const teamResults = resultsByTeamId.get(teamId);

  if (teamResults) {
    teamResults.push({ scheduledAt, result });
    return;
  }

  resultsByTeamId.set(teamId, [{ scheduledAt, result }]);
}
