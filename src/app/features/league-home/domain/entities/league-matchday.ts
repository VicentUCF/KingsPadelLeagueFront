export type LeagueMatchdayStatus = 'completed' | 'current' | 'upcoming';

export interface LeagueMatchday {
  readonly id: string;
  readonly number: number;
  readonly label: string;
  readonly status: LeagueMatchdayStatus;
  readonly dateLabel: string;
  readonly encounters: readonly LeagueMatchdayEncounter[];
  readonly byeTeam: LeagueMatchdayByeTeam | null;
}

export interface LeagueMatchdayByeTeam {
  readonly teamId: string;
  readonly teamSlug: string;
  readonly teamName: string;
}

export interface LeagueMatchdayEncounter {
  readonly id: string;
  readonly homeTeamId: string;
  readonly homeTeamSlug: string;
  readonly homeTeamName: string;
  readonly awayTeamId: string;
  readonly awayTeamSlug: string;
  readonly awayTeamName: string;
  readonly homeScore: number;
  readonly awayScore: number;
  readonly status: LeagueMatchdayStatus;
  readonly scheduledAtLabel: string;
  readonly pairResults: readonly LeagueMatchPairResult[];
}

export interface LeagueMatchPairResult {
  readonly id: string;
  readonly label: string;
  readonly homePair: LeagueMatchPairLineup;
  readonly awayPair: LeagueMatchPairLineup;
  readonly homeScoreLabel: string;
  readonly awayScoreLabel: string;
  readonly winnerTeamId: string | null;
}

export interface LeagueMatchPairLineup {
  readonly label: string;
  readonly players: readonly LeagueMatchPairPlayer[];
}

export interface LeagueMatchPairPlayer {
  readonly id: string;
  readonly displayName: string;
  readonly roleLabel: string;
}
