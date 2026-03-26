export interface BackofficeSeasonPlayerScore {
  readonly id: string;
  readonly seasonId: string;
  readonly playerId: string;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly wonPairMatches: number;
  readonly lostPairMatches: number;
  readonly wonSets: number;
  readonly lostSets: number;
}
