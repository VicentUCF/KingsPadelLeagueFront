import {
  type ByeTeamSummary,
  type EncounterResultSummary,
  type LeagueHomeSnapshot,
  type StandingEntry,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';

import { withSignedValue } from './league-ui-formatters';
import { resolveTeamBranding, type TeamBrandingPalette } from './league-team-branding';

export interface LeagueHomeViewModel {
  readonly leagueName: string;
  readonly leagueTagline: string;
  readonly seasonLabel: string;
  readonly phaseLabel: string;
  readonly currentMatchdayLabel: string;
  readonly nextSectionTitle: string;
  readonly nextMatches: readonly NextMatchCardViewModel[];
  readonly standings: readonly StandingsRowViewModel[];
  readonly byeTeam: ByeCardViewModel | null;
  readonly lastResults: readonly ResultCardViewModel[];
  readonly teams: readonly TeamCardViewModel[];
}

export interface NextMatchCardViewModel {
  readonly id: string;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly scheduledAtLabel: string;
}

export interface StandingsRowViewModel {
  readonly teamId: string;
  readonly rank: number;
  readonly teamName: string;
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
  readonly pointsLabel: string;
  readonly playedMatchesLabel: string;
  readonly gameDifferenceLabel: string;
  readonly teamLink: string;
  readonly isLeader: boolean;
  readonly isLast: boolean;
  readonly rankTone: 'leader' | 'podium' | 'standard';
  readonly gameDifferenceTone: 'positive' | 'negative' | 'neutral';
}

export interface ByeCardViewModel {
  readonly teamName: string;
  readonly description: string;
}

export interface ResultCardViewModel {
  readonly id: string;
  readonly matchupLabel: string;
  readonly pairOneScoreLabel: string;
  readonly pairTwoScoreLabel: string;
  readonly encounterScoreLabel: string;
  readonly winnerTeamName: string;
}

export interface TeamCardViewModel {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly presidentName: string;
  readonly playerCountLabel: string;
  readonly monogram: string;
  readonly logoPath: string | null;
  readonly palette: TeamBrandingPalette;
  readonly teamLink: string;
}

export function toLeagueHomeViewModel(snapshot: LeagueHomeSnapshot): LeagueHomeViewModel {
  const teamSlugById = createTeamSlugById(snapshot.teams);
  const hasCompetitiveStandings = snapshot.standings.some((entry) => {
    return entry.points > 0 || entry.playedMatches > 0 || entry.gameDifference !== 0;
  });

  return {
    leagueName: snapshot.league.name,
    leagueTagline: snapshot.league.tagline,
    seasonLabel: snapshot.league.seasonLabel,
    phaseLabel: snapshot.currentPhase.label,
    currentMatchdayLabel: snapshot.currentMatchday.label,
    nextSectionTitle: toNextSectionTitle(snapshot.currentPhase.code),
    nextMatches: snapshot.nextMatches.map((match) => ({
      id: match.id,
      homeTeamName: match.homeTeamName,
      awayTeamName: match.awayTeamName,
      scheduledAtLabel: match.scheduledAtLabel,
    })),
    standings: snapshot.standings.map((entry, index, rows) =>
      toStandingsRowViewModel(
        entry,
        teamSlugById,
        hasCompetitiveStandings && index === 0,
        hasCompetitiveStandings && index === rows.length - 1,
        hasCompetitiveStandings,
      ),
    ),
    byeTeam: toByeCardViewModel(snapshot.byeTeam),
    lastResults: snapshot.lastResults.map(toResultCardViewModel),
    teams: snapshot.teams.map(toTeamCardViewModel),
  };
}

function toStandingsRowViewModel(
  entry: StandingEntry,
  teamSlugById: ReadonlyMap<string, string>,
  isLeader: boolean,
  isLast: boolean,
  hasCompetitiveStandings: boolean,
): StandingsRowViewModel {
  const rankTone = toRankTone(entry.rank);
  const teamSlug = teamSlugById.get(entry.teamId) ?? null;
  const branding = resolveTeamBranding({
    teamName: entry.teamName,
    teamSlug,
  });

  return {
    teamId: entry.teamId,
    rank: entry.rank,
    teamName: entry.teamName,
    monogram: branding.monogram,
    logoPath: branding.logoPath,
    palette: branding.palette,
    pointsLabel: `${entry.points} pts`,
    playedMatchesLabel: `${entry.playedMatches}`,
    gameDifferenceLabel: withSignedValue(entry.gameDifference),
    teamLink: toTeamLink(teamSlug),
    isLeader,
    isLast,
    rankTone: hasCompetitiveStandings ? rankTone : 'standard',
    gameDifferenceTone: toGameDifferenceTone(entry.gameDifference),
  };
}

function toByeCardViewModel(byeTeam: ByeTeamSummary | null): ByeCardViewModel | null {
  if (!byeTeam) {
    return null;
  }

  return {
    teamName: byeTeam.teamName,
    description: `${byeTeam.matchdayLabel} · Descansa`,
  };
}

function toResultCardViewModel(result: EncounterResultSummary): ResultCardViewModel {
  return {
    id: result.id,
    matchupLabel: `${result.homeTeamName} vs ${result.awayTeamName}`,
    pairOneScoreLabel: result.pairOneScore,
    pairTwoScoreLabel: result.pairTwoScore,
    encounterScoreLabel: `${result.homeTeamName} ${result.homePoints} — ${result.awayPoints} ${result.awayTeamName}`,
    winnerTeamName: result.winnerTeamName,
  };
}

function toTeamCardViewModel(team: TeamSummary): TeamCardViewModel {
  const branding = resolveTeamBranding({
    teamName: team.name,
    teamSlug: team.slug,
  });

  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    playerCountLabel: `Jugadores: ${team.playerCount}`,
    monogram: branding.monogram,
    logoPath: branding.logoPath,
    palette: branding.palette,
    teamLink: toTeamLink(team.slug),
  };
}

function createTeamSlugById(teams: readonly TeamSummary[]): ReadonlyMap<string, string> {
  return new Map(teams.map((team) => [team.id, team.slug]));
}

function toTeamLink(teamSlug: string | null): string {
  return teamSlug ? `/equipos/${teamSlug}` : '/equipos';
}

function toNextSectionTitle(phaseCode: LeagueHomeSnapshot['currentPhase']['code']): string {
  if (phaseCode === 'playoff') {
    return 'Próximos cruces';
  }

  if (phaseCode === 'preseason') {
    return 'Calendario pendiente';
  }

  return 'Próxima jornada';
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
