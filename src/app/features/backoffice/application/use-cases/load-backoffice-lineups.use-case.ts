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
}
