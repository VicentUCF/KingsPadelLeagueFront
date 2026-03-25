export type BackofficePairMatchStatus = 'scheduled' | 'in_progress' | 'finished';

export interface BackofficePairMatchSetResult {
  readonly local: number;
  readonly away: number;
}

export interface BackofficePairMatch {
  readonly id: string;
  readonly localLineUpPairId: string;
  readonly awayLineUpPairId: string;
  readonly status: BackofficePairMatchStatus;
  readonly setsResult: readonly BackofficePairMatchSetResult[];
}
