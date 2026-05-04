import {
  type LeagueHomeSnapshot,
  type StandingEntry,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';
import {
  type LeagueMatchday,
  type LeagueMatchdayEncounter,
} from '@features/league-home/domain/entities/league-matchday';

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
  readonly isLeader: boolean;
  readonly isLast: boolean;
  readonly rankTone: 'leader' | 'podium' | 'standard';
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
  const standings = toStandingsViewModel(snapshot.standings, snapshot.teams, matchdays);

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
  standings: readonly StandingEntry[],
  teams: readonly TeamSummary[],
  matchdays: readonly LeagueMatchday[],
): readonly LeagueStandingsTableRowViewModel[] {
  interface SupplementalTeamStandingStats {
    won: number;
    lost: number;
  }

  const teamSlugById = createTeamSlugById(teams);
  const supplementalStatsByTeamId = new Map<string, SupplementalTeamStandingStats>(
    teams.map((team) => [
      team.id,
      {
        won: 0,
        lost: 0,
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

      const homeStats = supplementalStatsByTeamId.get(encounter.homeTeamId);
      const awayStats = supplementalStatsByTeamId.get(encounter.awayTeamId);

      if (!homeStats || !awayStats) {
        continue;
      }

      if (encounter.homeScore > encounter.awayScore) {
        homeStats.won += 1;
        awayStats.lost += 1;
      } else if (encounter.awayScore > encounter.homeScore) {
        awayStats.won += 1;
        homeStats.lost += 1;
      }
    }
  }

  const hasCompetitiveStandings = standings.some((entry) => {
    return entry.points > 0 || entry.playedMatches > 0 || entry.gameDifference !== 0;
  });

  return standings.map((entry, index, rows) => {
    const teamSlug = teamSlugById.get(entry.teamId) ?? null;
    const branding = resolveTeamBranding({
      teamName: entry.teamName,
      teamSlug,
    });
    const supplementalStats = supplementalStatsByTeamId.get(entry.teamId) ?? {
      won: 0,
      lost: 0,
    };

    return {
      teamId: entry.teamId,
      rank: entry.rank,
      teamName: entry.teamName,
      monogram: branding.monogram,
      logoPath: branding.logoPath,
      teamLink: toTeamLink(teamSlug),
      pointsLabel: `${entry.points} pts`,
      playedLabel: `${entry.playedMatches}`,
      wonLabel: `${supplementalStats.won}`,
      lostLabel: `${supplementalStats.lost}`,
      isLeader: hasCompetitiveStandings && index === 0,
      isLast: hasCompetitiveStandings && index === rows.length - 1,
      rankTone: hasCompetitiveStandings ? toRankTone(entry.rank) : 'standard',
    };
  });
}

function isDecidedEncounter(encounter: LeagueMatchdayEncounter): boolean {
  return encounter.homeScore !== encounter.awayScore;
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
