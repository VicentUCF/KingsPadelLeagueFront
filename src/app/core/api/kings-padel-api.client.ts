import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from './api-base-url.token';
import type {
  MatchdayHttpV1,
  MatchHttpV1,
  MatchTeamLineUpHttpV1,
  MatchTeamLineUpPairHttpV1,
  PaginatedResponse,
  PairMatchHttpV1,
  PlayerHttpV1,
  TeamHttpV1,
} from './kings-padel-api.types';

const TEAMS_LIMIT = '100';
const PLAYERS_LIMIT = '200';
const MATCHDAYS_LIMIT = '100';
const MATCHES_LIMIT = '200';
const LINEUPS_LIMIT = '200';
const LINEUP_PAIRS_LIMIT = '200';
const PAIR_MATCHES_LIMIT = '200';

@Injectable({ providedIn: 'root' })
export class KingsPadelApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly collectionCache = new Map<string, Promise<readonly unknown[]>>();

  loadTeams(forceRefresh = false): Promise<readonly TeamHttpV1[]> {
    return this.loadCollection<TeamHttpV1>('teams', '/v1/teams', TEAMS_LIMIT, forceRefresh);
  }

  loadPlayers(forceRefresh = false): Promise<readonly PlayerHttpV1[]> {
    return this.loadCollection<PlayerHttpV1>('players', '/v1/players', PLAYERS_LIMIT, forceRefresh);
  }

  loadMatchdays(forceRefresh = false): Promise<readonly MatchdayHttpV1[]> {
    return this.loadCollection<MatchdayHttpV1>(
      'matchdays',
      '/v1/matchdays',
      MATCHDAYS_LIMIT,
      forceRefresh,
    );
  }

  loadMatches(forceRefresh = false): Promise<readonly MatchHttpV1[]> {
    return this.loadCollection<MatchHttpV1>('matches', '/v1/matches', MATCHES_LIMIT, forceRefresh);
  }

  loadLineups(forceRefresh = false): Promise<readonly MatchTeamLineUpHttpV1[]> {
    return this.loadCollection<MatchTeamLineUpHttpV1>(
      'lineups',
      '/v1/match-team-line-ups',
      LINEUPS_LIMIT,
      forceRefresh,
    );
  }

  loadLineupPairs(forceRefresh = false): Promise<readonly MatchTeamLineUpPairHttpV1[]> {
    return this.loadCollection<MatchTeamLineUpPairHttpV1>(
      'lineup-pairs',
      '/v1/match-team-line-up-pairs',
      LINEUP_PAIRS_LIMIT,
      forceRefresh,
    );
  }

  loadPairMatches(forceRefresh = false): Promise<readonly PairMatchHttpV1[]> {
    return this.loadCollection<PairMatchHttpV1>(
      'pair-matches',
      '/v1/pair-matches',
      PAIR_MATCHES_LIMIT,
      forceRefresh,
    );
  }

  private loadCollection<T>(
    cacheKey: string,
    path: string,
    limit: string,
    forceRefresh: boolean,
  ): Promise<readonly T[]> {
    if (forceRefresh) {
      this.collectionCache.delete(cacheKey);
    }

    const cachedCollection = this.collectionCache.get(cacheKey) as
      | Promise<readonly T[]>
      | undefined;

    if (cachedCollection) {
      return cachedCollection;
    }

    const request = firstValueFrom(
      this.http.get<PaginatedResponse<T>>(`${this.baseUrl}${path}`, {
        params: { limit },
      }),
    ).then((response) => response.items);

    this.collectionCache.set(cacheKey, request as Promise<readonly unknown[]>);
    request.catch(() => {
      if (this.collectionCache.get(cacheKey) === request) {
        this.collectionCache.delete(cacheKey);
      }
    });

    return request;
  }
}
