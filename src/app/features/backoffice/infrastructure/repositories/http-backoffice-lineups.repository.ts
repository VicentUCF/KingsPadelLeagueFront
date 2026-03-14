import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type {
  MatchTeamLineUpHttpV1,
  MatchTeamLineUpPairHttpV1,
  PaginatedResponse,
} from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import type { BackofficeLineupsRepository } from '@features/backoffice/application/ports/backoffice-lineups.repository';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';

@Injectable()
export class HttpBackofficeLineupsRepository implements BackofficeLineupsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  loadByMatchIds(matchIds: string[]): Promise<readonly BackofficeLineup[]> {
    let params = new HttpParams().append('limit', '200');
    for (const id of matchIds) {
      params = params.append('matchIds[]', id);
    }
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchTeamLineUpHttpV1>>(
        `${this.baseUrl}/v1/match-team-line-ups`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-lineups' }),
        },
      ),
    ).then((res) => res.items.map(mapLineup));
  }

  loadPairsByLineupIds(lineupIds: string[]): Promise<readonly BackofficeLineupPair[]> {
    let params = new HttpParams().append('limit', '200');
    for (const id of lineupIds) {
      params = params.append('matchTeamLineUpIds[]', id);
    }
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchTeamLineUpPairHttpV1>>(
        `${this.baseUrl}/v1/match-team-line-up-pairs`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-lineup-pairs' }),
        },
      ),
    ).then((res) => res.items.map(mapPair));
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
    wonGame: raw.wonGame ?? null,
    sets: raw.sets ?? [],
  };
}
