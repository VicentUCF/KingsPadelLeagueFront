import {
  type LeagueHomeSnapshot,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';
import {
  type LeagueMatchPairResult,
  type LeagueMatchday,
  type LeagueMatchdayEncounter,
} from '@features/league-home/domain/entities/league-matchday';

import { withSignedValue } from './league-ui-formatters';
import { resolveTeamBranding } from './league-team-branding';

export interface LeagueStandingsTableRowViewModel {
  readonly teamId: string;
  readonly rank: number;
  readonly teamName: string;
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly teamLink: string;
  readonly pointsLabel: string;
  readonly playedLabel: string;
  readonly wonLabel: string;
  readonly lostLabel: string;
  readonly wonGamesLabel: string;
  readonly lostGamesLabel: string;
  readonly gameDifferenceLabel: string;
  readonly isLeader: boolean;
  readonly isLast: boolean;
  readonly rankTone: 'leader' | 'podium' | 'standard';
  readonly gameDifferenceTone: 'positive' | 'negative' | 'neutral';
}

export interface LeagueStandingsPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly currentMatchdayLabel: string;
  readonly phaseLabel: string;
  readonly tableCaption: string;
  readonly tieBreakRules: readonly string[];
  readonly standings: readonly LeagueStandingsTableRowViewModel[];
}

export function toLeagueStandingsPageViewModel(
  snapshot: LeagueHomeSnapshot,
  matchdays: readonly LeagueMatchday[],
): LeagueStandingsPageViewModel {
  const standings = toStandingsViewModel(snapshot.teams, matchdays);

  return {
    eyebrow: 'Clasificación',
    title: `Clasificación oficial de la temporada ${snapshot.league.seasonLabel.replace('Temporada ', '')}`,
    description:
      'Consulta la tabla de equipos de la KingsPadelLeague y sigue la evolución de la competición jornada a jornada.',
    currentMatchdayLabel: snapshot.currentMatchday.label,
    phaseLabel: snapshot.currentPhase.label,
    tableCaption: `Clasificación de ${snapshot.league.name}`,
    tieBreakRules: [
      'Puntos totales',
      'Enfrentamiento directo',
      'Diferencia de juegos',
      'Juegos a favor',
    ],
    standings,
  };
}

function toStandingsViewModel(
  teams: readonly TeamSummary[],
  matchdays: readonly LeagueMatchday[],
): readonly LeagueStandingsTableRowViewModel[] {
  interface TeamStandingStats {
    readonly teamId: string;
    readonly teamName: string;
    won: number;
    lost: number;
    wonGames: number;
    lostGames: number;
  }

  const teamSlugById = createTeamSlugById(teams);
  const statsByTeamId = new Map<string, TeamStandingStats>(
    teams.map((team) => [
      team.id,
      {
        teamId: team.id,
        teamName: team.name,
        won: 0,
        lost: 0,
        wonGames: 0,
        lostGames: 0,
      },
    ]),
  );

  for (const matchday of matchdays) {
    if (matchday.status === 'upcoming') {
      continue;
    }

    for (const encounter of matchday.encounters) {
      if (!isDecidedEncounter(encounter)) {
        continue;
      }

      const homeStats = statsByTeamId.get(encounter.homeTeamId);
      const awayStats = statsByTeamId.get(encounter.awayTeamId);

      if (!homeStats || !awayStats) {
        continue;
      }

      const gameTotals = calculateEncounterGameTotals(encounter.pairResults);

      homeStats.wonGames += gameTotals.home;
      homeStats.lostGames += gameTotals.away;
      awayStats.wonGames += gameTotals.away;
      awayStats.lostGames += gameTotals.home;

      if (encounter.homeScore > encounter.awayScore) {
        homeStats.won += 1;
        awayStats.lost += 1;
      } else if (encounter.awayScore > encounter.homeScore) {
        awayStats.won += 1;
        homeStats.lost += 1;
      }
    }
  }

  const sortedRows = [...statsByTeamId.values()]
    .map((stats) => ({
      ...stats,
      played: stats.won + stats.lost,
      points: stats.won * 3,
      gameDifference: stats.wonGames - stats.lostGames,
    }))
    .sort((leftTeam, rightTeam) => {
      if (rightTeam.points !== leftTeam.points) {
        return rightTeam.points - leftTeam.points;
      }

      if (rightTeam.gameDifference !== leftTeam.gameDifference) {
        return rightTeam.gameDifference - leftTeam.gameDifference;
      }

      if (rightTeam.wonGames !== leftTeam.wonGames) {
        return rightTeam.wonGames - leftTeam.wonGames;
      }

      return leftTeam.teamName.localeCompare(rightTeam.teamName, 'es');
    });

  const hasCompetitiveStandings = sortedRows.some((row) => {
    return row.points > 0 || row.played > 0 || row.wonGames > 0 || row.lostGames > 0;
  });

  return sortedRows.map((row, index, rows) => {
    const teamSlug = teamSlugById.get(row.teamId) ?? null;
    const branding = resolveTeamBranding({
      teamName: row.teamName,
      teamSlug,
    });

    return {
      teamId: row.teamId,
      rank: index + 1,
      teamName: row.teamName,
      monogram: branding.monogram,
      logoPath: branding.logoPath,
      teamLink: toTeamLink(teamSlug),
      pointsLabel: `${row.points} pts`,
      playedLabel: `${row.played}`,
      wonLabel: `${row.won}`,
      lostLabel: `${row.lost}`,
      wonGamesLabel: `${row.wonGames}`,
      lostGamesLabel: `${row.lostGames}`,
      gameDifferenceLabel: withSignedValue(row.gameDifference),
      isLeader: hasCompetitiveStandings && index === 0,
      isLast: hasCompetitiveStandings && index === rows.length - 1,
      rankTone: hasCompetitiveStandings ? toRankTone(index + 1) : 'standard',
      gameDifferenceTone: toGameDifferenceTone(row.gameDifference),
    };
  });
}

function isDecidedEncounter(encounter: LeagueMatchdayEncounter): boolean {
  return encounter.homeScore !== encounter.awayScore;
}

function calculateEncounterGameTotals(pairResults: readonly LeagueMatchPairResult[]): {
  readonly home: number;
  readonly away: number;
} {
  return pairResults.reduce(
    (totals, pairResult) => {
      const scorePairs = parseScoreLabel(pairResult.homeScoreLabel);

      return scorePairs.reduce(
        (pairTotals, [homeScore, awayScore]) => ({
          home: pairTotals.home + homeScore,
          away: pairTotals.away + awayScore,
        }),
        totals,
      );
    },
    { home: 0, away: 0 },
  );
}

function parseScoreLabel(label: string): readonly (readonly [number, number])[] {
  if (label.trim().toLowerCase() === 'pendiente') {
    return [];
  }

  return label
    .split('·')
    .map((setLabel) =>
      setLabel
        .trim()
        .split('/')
        .map((value) => Number(value.trim())),
    )
    .filter((scores): scores is [number, number] => {
      const [homeScore, awayScore] = scores;

      return Number.isFinite(homeScore) && Number.isFinite(awayScore);
    });
}

function createTeamSlugById(teams: readonly TeamSummary[]): ReadonlyMap<string, string> {
  return new Map(teams.map((team) => [team.id, team.slug]));
}

function toTeamLink(teamSlug: string | null): string {
  return teamSlug ? `/equipos/${teamSlug}` : '/equipos';
}

function toRankTone(rank: number): 'leader' | 'podium' | 'standard' {
  if (rank === 1) {
    return 'leader';
  }

  if (rank === 2 || rank === 3) {
    return 'podium';
  }

  return 'standard';
}

function toGameDifferenceTone(value: number): 'positive' | 'negative' | 'neutral' {
  if (value > 0) {
    return 'positive';
  }

  if (value < 0) {
    return 'negative';
  }

  return 'neutral';
}
