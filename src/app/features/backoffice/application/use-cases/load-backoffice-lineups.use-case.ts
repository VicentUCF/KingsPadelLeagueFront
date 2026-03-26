import { inject, Injectable } from '@angular/core';

import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import { BACKOFFICE_LINEUPS_REPOSITORY } from '@features/backoffice/application/ports/backoffice-lineups.repository';

@Injectable()
export class LoadBackofficeLineupsUseCase {
  private readonly repo = inject(BACKOFFICE_LINEUPS_REPOSITORY);

  byMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]> {
    return this.repo.loadByMatchIds(matchIds);
  }

  pairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]> {
    return this.repo.loadPairsByLineupIds(lineupIds);
  }

  create(matchId: string, teamId: string): Promise<BackofficeLineup> {
    return this.repo.create(matchId, teamId);
  }

  createPair(
    lineupId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<BackofficeLineupPair> {
    return this.repo.createPair(lineupId, player1Id, player2Id);
  }

  updatePair(pairId: string, player1Id: string | null, player2Id: string | null): Promise<void> {
    return this.repo.updatePair(pairId, player1Id, player2Id);
  }

  submit(lineupId: string): Promise<void> {
    return this.repo.submit(lineupId);
  }
}
