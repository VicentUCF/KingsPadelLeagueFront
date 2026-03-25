import { InjectionToken } from '@angular/core';

import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';

export interface FinishBackofficePairMatchInput {
  readonly setsResult: readonly {
    readonly local: number;
    readonly away: number;
  }[];
}

export interface BackofficePairMatchesRepository {
  loadByLineupPairIds(lineupPairIds: readonly string[]): Promise<readonly BackofficePairMatch[]>;
  finish(pairMatchId: string, input: FinishBackofficePairMatchInput): Promise<void>;
}

export const BACKOFFICE_PAIR_MATCHES_REPOSITORY =
  new InjectionToken<BackofficePairMatchesRepository>('BackofficePairMatchesRepository');
