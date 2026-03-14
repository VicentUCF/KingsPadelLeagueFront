import { InjectionToken } from '@angular/core';

import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

export interface BackofficeMatchFilter {
  matchdayIds?: string[];
  localTeamIds?: string[];
  awayTeamIds?: string[];
}

export interface BackofficeMatchesRepository {
  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]>;
  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]>;
}

export const BACKOFFICE_MATCHES_REPOSITORY = new InjectionToken<BackofficeMatchesRepository>(
  'BackofficeMatchesRepository',
);
