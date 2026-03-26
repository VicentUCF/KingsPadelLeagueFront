import { InjectionToken } from '@angular/core';

import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

export interface BackofficeMatchFilter {
  matchdayIds?: string[];
  localTeamIds?: string[];
  awayTeamIds?: string[];
}

export interface CreateBackofficeMatchInput {
  readonly matchdayId: string;
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly scheduledAt: string;
  readonly localTeamScorePoints: number;
  readonly awayTeamScorePoints: number;
}

export interface BackofficeMatchesRepository {
  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]>;
  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]>;
  create(input: CreateBackofficeMatchInput): Promise<BackofficeMatch>;
  start(matchId: string): Promise<void>;
  finish(matchId: string): Promise<void>;
}

export const BACKOFFICE_MATCHES_REPOSITORY = new InjectionToken<BackofficeMatchesRepository>(
  'BackofficeMatchesRepository',
);
