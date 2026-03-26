export interface BackofficeSeasonTeamScore {
  readonly id: string;
  readonly seasonId: string;
  readonly teamId: string;
  readonly totalPoints: number;
  readonly wonMatches: number;
  readonly lostMatches: number;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly wonSets: number;
  readonly lostSets: number;
}
