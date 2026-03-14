import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { MatchHttpV1, PaginatedResponse } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import type { BackofficeMatchesRepository } from '@features/backoffice/application/ports/backoffice-matches.repository';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

@Injectable()
export class HttpBackofficeMatchesRepository implements BackofficeMatchesRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]> {
    const params = new HttpParams().append('matchdayIds[]', matchdayId).append('limit', '100');
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchHttpV1>>(`${this.baseUrl}/v1/matches`, {
        params,
        context: withHttpErrorToast({ key: 'load-matches-matchday' }),
      }),
    ).then((res) => res.items.map(mapMatch));
  }

  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]> {
    let params = new HttpParams().append('limit', '100');
    params = params.append('localTeamIds[]', teamId);
    params = params.append('awayTeamIds[]', teamId);
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchHttpV1>>(`${this.baseUrl}/v1/matches`, {
        params,
        context: withHttpErrorToast({ key: 'load-matches-team' }),
      }),
    ).then((res) => res.items.map(mapMatch));
  }
}

function mapMatch(raw: MatchHttpV1): BackofficeMatch {
  return {
    id: raw.id,
    matchdayId: raw.matchdayId,
    localTeamId: raw.localTeamId,
    awayTeamId: raw.awayTeamId,
    localTeamScorePoints: raw.localTeamScorePoints,
    awayTeamScorePoints: raw.awayTeamScorePoints,
    scheduledAt: new Date(raw.scheduledAt),
    mvpId: raw.mvpId ?? null,
  };
}
