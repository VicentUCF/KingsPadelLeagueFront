import {
  type ByeTeamSummary,
  type EncounterResultSummary,
  type LeagueHomeSnapshot,
  type StandingEntry,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';

export interface LeagueHomeViewModel {
  readonly leagueName: string;
  readonly leagueTagline: string;
  readonly seasonLabel: string;
  readonly phaseLabel: string;
  readonly currentMatchdayLabel: string;
  readonly nextSectionTitle: string;
  readonly nextMatches: readonly NextMatchCardViewModel[];
  readonly standings: readonly StandingsRowViewModel[];
  readonly byeTeam: ByeCardViewModel;
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
  readonly pointsLabel: string;
  readonly playedMatchesLabel: string;
  readonly gameDifferenceLabel: string;
  readonly isLeader: boolean;
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
  readonly name: string;
  readonly presidentName: string;
  readonly playerCountLabel: string;
  readonly monogram: string;
  readonly teamLink: string;
}

export function toLeagueHomeViewModel(snapshot: LeagueHomeSnapshot): LeagueHomeViewModel {
  return {
    leagueName: snapshot.league.name,
    leagueTagline: snapshot.league.tagline,
    seasonLabel: snapshot.league.seasonLabel,
    phaseLabel: snapshot.currentPhase.label,
    currentMatchdayLabel: snapshot.currentMatchday.label,
    nextSectionTitle:
      snapshot.currentPhase.code === 'playoff' ? 'Próximos cruces' : 'Próxima jornada',
    nextMatches: snapshot.nextMatches.map((match) => ({
      id: match.id,
      homeTeamName: match.homeTeamName,
      awayTeamName: match.awayTeamName,
      scheduledAtLabel: match.scheduledAtLabel,
    })),
    standings: snapshot.standings.map((entry, index) =>
      toStandingsRowViewModel(entry, index === 0),
    ),
    byeTeam: toByeCardViewModel(snapshot.byeTeam),
    lastResults: snapshot.lastResults.map(toResultCardViewModel),
    teams: snapshot.teams.map(toTeamCardViewModel),
  };
}

function toStandingsRowViewModel(entry: StandingEntry, isLeader: boolean): StandingsRowViewModel {
  return {
    teamId: entry.teamId,
    rank: entry.rank,
    teamName: entry.teamName,
    pointsLabel: `${entry.points} pts`,
    playedMatchesLabel: `${entry.playedMatches}`,
    gameDifferenceLabel: withSignedValue(entry.gameDifference),
    isLeader,
  };
}

function toByeCardViewModel(byeTeam: ByeTeamSummary): ByeCardViewModel {
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
  return {
    id: team.id,
    name: team.name,
    presidentName: team.presidentName,
    playerCountLabel: `Jugadores: ${team.playerCount}`,
    monogram: createMonogram(team.name),
    teamLink: '/equipos',
  };
}

function createMonogram(teamName: string): string {
  return teamName
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function withSignedValue(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}
