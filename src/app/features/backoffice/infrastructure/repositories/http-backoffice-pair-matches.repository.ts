import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { withJsonArrayParam } from '@core/api/http-query-params';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, PairMatchHttpV1 } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import type {
  BackofficePairMatchesRepository,
  FinishBackofficePairMatchInput,
} from '@features/backoffice/application/ports/backoffice-pair-matches.repository';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';

@Injectable()
export class HttpBackofficePairMatchesRepository implements BackofficePairMatchesRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  loadByLineupPairIds(lineupPairIds: readonly string[]): Promise<readonly BackofficePairMatch[]> {
    let params = new HttpParams().set('limit', '200');
    params = withJsonArrayParam(params, 'localLineUpPairIds', lineupPairIds);
    params = withJsonArrayParam(params, 'awayLineUpPairIds', lineupPairIds);

    return firstValueFrom(
      this.http.get<PaginatedResponse<PairMatchHttpV1>>(`${this.baseUrl}/v1/pair-matches`, {
        params,
        context: withHttpErrorToast({ key: 'load-pair-matches' }),
      }),
    ).then((res) => res.items.map(mapPairMatch));
  }

  finish(pairMatchId: string, input: FinishBackofficePairMatchInput): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/admin/v1/pair-matches/${pairMatchId}/finishes`, input, {
        context: withHttpErrorToast({ key: 'finish-pair-match' }),
      }),
    ).then(() => undefined);
  }
}

function mapPairMatch(raw: PairMatchHttpV1): BackofficePairMatch {
  return {
    id: raw.id,
    localLineUpPairId: raw.localLineUpPairId,
    awayLineUpPairId: raw.awayLineUpPairId,
    status: raw.status,
    setsResult: raw.setsResult ?? [],
  };
}
