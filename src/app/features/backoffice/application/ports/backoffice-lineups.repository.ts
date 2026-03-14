import { InjectionToken } from '@angular/core';

import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';

export interface BackofficeLineupsRepository {
  loadByMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]>;
  loadPairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]>;
}

export const BACKOFFICE_LINEUPS_REPOSITORY = new InjectionToken<BackofficeLineupsRepository>(
  'BackofficeLineupsRepository',
);
