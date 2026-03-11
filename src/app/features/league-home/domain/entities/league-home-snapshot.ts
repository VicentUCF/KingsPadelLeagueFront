export interface LeagueHomeSnapshot {
  readonly league: LeagueSummary;
  readonly currentPhase: LeaguePhaseSummary;
  readonly currentMatchday: CurrentMatchdaySummary;
  readonly standings: readonly StandingEntry[];
  readonly nextMatches: readonly NextMatchSummary[];
  readonly byeTeam: ByeTeamSummary;
  readonly lastResults: readonly EncounterResultSummary[];
  readonly teams: readonly TeamSummary[];
}

export interface LeagueSummary {
  readonly name: string;
  readonly tagline: string;
  readonly seasonLabel: string;
}

export interface LeaguePhaseSummary {
  readonly code: 'regular-season' | 'playoff';
  readonly label: string;
}

export interface CurrentMatchdaySummary {
  readonly current: number;
  readonly total: number;
  readonly label: string;
}

export interface StandingEntry {
  readonly teamId: string;
  readonly teamName: string;
  readonly rank: number;
  readonly points: number;
  readonly playedMatches: number;
  readonly gameDifference: number;
}

export interface NextMatchSummary {
  readonly id: string;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly scheduledAtIso: string;
  readonly scheduledAtLabel: string;
}

export interface ByeTeamSummary {
  readonly teamId: string;
  readonly teamName: string;
  readonly matchdayLabel: string;
}

export interface EncounterResultSummary {
  readonly id: string;
  readonly homeTeamName: string;
  readonly awayTeamName: string;
  readonly pairOneScore: string;
  readonly pairTwoScore: string;
  readonly homePoints: number;
  readonly awayPoints: number;
  readonly winnerTeamName: string;
}

export interface TeamSummary {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly presidentName: string;
  readonly playerCount: number;
}
