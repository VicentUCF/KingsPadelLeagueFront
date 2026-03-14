export type BackofficeLineupStatus = 'pending' | 'submited';

export interface BackofficeLineup {
  readonly id: string;
  readonly matchId: string;
  readonly teamId: string;
  readonly status: BackofficeLineupStatus;
}

export interface BackofficeSetResult {
  readonly localScore: number;
  readonly awayScore: number;
}

export interface BackofficeLineupPair {
  readonly id: string;
  readonly lineupId: string;
  readonly player1Id: string;
  readonly player2Id: string;
  readonly totalPlayersValue: number;
  readonly wonGame: boolean | null;
  readonly sets: readonly BackofficeSetResult[];
}
