import { inject, Injectable } from '@angular/core';

import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import { BACKOFFICE_MATCHES_REPOSITORY } from '@features/backoffice/application/ports/backoffice-matches.repository';

@Injectable()
export class LoadBackofficeMatchesUseCase {
  private readonly repo = inject(BACKOFFICE_MATCHES_REPOSITORY);

  byMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]> {
    return this.repo.loadByMatchday(matchdayId);
  }

  byTeam(teamId: string): Promise<readonly BackofficeMatch[]> {
    return this.repo.loadByTeam(teamId);
  }

  byMatchdayAndTeam(matchdayId: string, teamId: string): Promise<readonly BackofficeMatch[]> {
    return this.repo.loadByMatchdayAndTeam(matchdayId, teamId);
  }
}
