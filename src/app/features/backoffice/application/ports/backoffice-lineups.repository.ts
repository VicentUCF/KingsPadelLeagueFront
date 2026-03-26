import { InjectionToken } from '@angular/core';

import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';

export interface BackofficeLineupsRepository {
  loadByMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]>;
  loadPairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]>;
  create(matchId: string, teamId: string): Promise<BackofficeLineup>;
  createPair(lineupId: string, player1Id: string, player2Id: string): Promise<BackofficeLineupPair>;
  updatePair(pairId: string, player1Id: string | null, player2Id: string | null): Promise<void>;
  submit(lineupId: string): Promise<void>;
}

export const BACKOFFICE_LINEUPS_REPOSITORY = new InjectionToken<BackofficeLineupsRepository>(
  'BackofficeLineupsRepository',
);
