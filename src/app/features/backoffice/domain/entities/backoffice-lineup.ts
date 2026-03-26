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
  readonly player1Id: string | null;
  readonly player2Id: string | null;
  readonly totalPlayersValue: number;
  readonly wonGame: boolean | null;
  readonly sets: readonly BackofficeSetResult[];
}
