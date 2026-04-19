import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { withJsonArrayParam } from '@core/api/http-query-params';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { MatchHttpV1, PaginatedResponse } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import type {
  BackofficeMatchesRepository,
  CreateBackofficeMatchInput,
} from '@features/backoffice/application/ports/backoffice-matches.repository';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

@Injectable()
export class HttpBackofficeMatchesRepository implements BackofficeMatchesRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly matchesBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN' ? '/admin/v1/matches' : '/v1/matches',
  );

  loadByMatchday(matchdayId: string): Promise<readonly BackofficeMatch[]> {
    const params = withJsonArrayParam(new HttpParams().set('limit', '100'), 'matchdayIds', [
      matchdayId,
    ]);
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchHttpV1>>(`${this.baseUrl}${this.matchesBasePath()}`, {
        params,
        context: withHttpErrorToast({ key: 'load-matches-matchday' }),
      }),
    ).then((res) => res.items.map(mapMatch));
  }

  loadByTeam(teamId: string): Promise<readonly BackofficeMatch[]> {
    let params = new HttpParams().set('limit', '100');
    params = withJsonArrayParam(params, 'localTeamIds', [teamId]);
    params = withJsonArrayParam(params, 'awayTeamIds', [teamId]);
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchHttpV1>>(`${this.baseUrl}${this.matchesBasePath()}`, {
        params,
        context: withHttpErrorToast({ key: 'load-matches-team' }),
      }),
    ).then((res) => res.items.map(mapMatch));
  }

  loadByMatchdayAndTeam(matchdayId: string, teamId: string): Promise<readonly BackofficeMatch[]> {
    let params = new HttpParams().set('limit', '100');
    params = withJsonArrayParam(params, 'matchdayIds', [matchdayId]);
    params = withJsonArrayParam(params, 'teamIds', [teamId]);

    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchHttpV1>>(`${this.baseUrl}${this.matchesBasePath()}`, {
        params,
        context: withHttpErrorToast({ key: 'load-matches-matchday-team' }),
      }),
    ).then((res) => res.items.map(mapMatch));
  }

  create(input: CreateBackofficeMatchInput): Promise<BackofficeMatch> {
    return firstValueFrom(
      this.http.post<MatchHttpV1>(`${this.baseUrl}/admin/v1/matches`, input, {
        context: withHttpErrorToast({ key: 'create-match' }),
      }),
    ).then(mapMatch);
  }

  start(matchId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/admin/v1/matches/${matchId}/starts`, null, {
        context: withHttpErrorToast({ key: 'start-match' }),
      }),
    ).then(() => undefined);
  }

  finish(matchId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/admin/v1/matches/${matchId}/finishes`, null, {
        context: withHttpErrorToast({ key: 'finish-match' }),
      }),
    ).then(() => undefined);
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
    status: raw.status,
  };
}
