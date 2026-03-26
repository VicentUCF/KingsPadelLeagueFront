import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { withJsonArrayParam } from '@core/api/http-query-params';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import type {
  MatchTeamLineUpHttpV1,
  MatchTeamLineUpPairHttpV1,
  PaginatedResponse,
} from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import type { BackofficeLineupsRepository } from '@features/backoffice/application/ports/backoffice-lineups.repository';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';

@Injectable()
export class HttpBackofficeLineupsRepository implements BackofficeLineupsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly lineupsBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN'
      ? '/admin/v1/match-team-line-ups'
      : '/v1/match-team-line-ups',
  );
  private readonly lineupPairsBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN'
      ? '/admin/v1/match-team-line-up-pairs'
      : '/v1/match-team-line-up-pairs',
  );

  loadByMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]> {
    const params = withJsonArrayParam(new HttpParams().set('limit', '200'), 'matchIds', matchIds);
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchTeamLineUpHttpV1>>(
        `${this.baseUrl}${this.lineupsBasePath()}`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-lineups' }),
        },
      ),
    ).then((res) => res.items.map(mapLineup));
  }

  loadPairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]> {
    const params = withJsonArrayParam(
      new HttpParams().set('limit', '200').set('sortBy', JSON.stringify([{ createdAt: 'ASC' }])),
      'matchTeamLineUpIds',
      lineupIds,
    );
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchTeamLineUpPairHttpV1>>(
        `${this.baseUrl}${this.lineupPairsBasePath()}`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-lineup-pairs' }),
        },
      ),
    ).then((res) => res.items.map(mapPair));
  }

  create(matchId: string, teamId: string): Promise<BackofficeLineup> {
    return firstValueFrom(
      this.http.post<MatchTeamLineUpHttpV1>(`${this.baseUrl}/admin/v1/match-team-line-ups`, {
        matchId,
        teamId,
      }),
    ).then(mapLineup);
  }

  createPair(
    lineupId: string,
    player1Id: string,
    player2Id: string,
  ): Promise<BackofficeLineupPair> {
    return firstValueFrom(
      this.http.post<MatchTeamLineUpPairHttpV1>(`${this.baseUrl}/v1/match-team-line-up-pairs`, {
        matchTeamLineUpId: lineupId,
        player1Id,
        player2Id,
      }),
    ).then(mapPair);
  }

  updatePair(pairId: string, player1Id: string | null, player2Id: string | null): Promise<void> {
    return firstValueFrom(
      this.http.patch<void>(`${this.baseUrl}/v1/match-team-line-up-pairs/${pairId}`, {
        player1Id,
        player2Id,
      }),
    ).then(() => undefined);
  }

  submit(lineupId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/v1/match-team-line-ups/${lineupId}/submits`, null),
    ).then(() => undefined);
  }
}

function mapLineup(raw: MatchTeamLineUpHttpV1): BackofficeLineup {
  return {
    id: raw.id,
    matchId: raw.matchId,
    teamId: raw.teamId,
    status: raw.status,
  };
}

function mapPair(raw: MatchTeamLineUpPairHttpV1): BackofficeLineupPair {
  return {
    id: raw.id,
    lineupId: raw.matchTeamLineUpId,
    player1Id: raw.player1Id,
    player2Id: raw.player2Id,
    totalPlayersValue: raw.totalPlayersValue,
    wonGame: null,
    sets: [],
  };
}
