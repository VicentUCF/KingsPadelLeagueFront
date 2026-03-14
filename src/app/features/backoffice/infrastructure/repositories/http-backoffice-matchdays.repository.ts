import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { MatchdayHttpV1, PaginatedResponse } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';

@Injectable()
export class HttpBackofficeMatchdaysRepository extends BackofficeMatchdaysRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  override loadAll(): Promise<readonly BackofficeMatchday[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchdayHttpV1>>(`${this.baseUrl}/v1/matchdays`, {
        params: { limit: '100' },
        context: withHttpErrorToast({ key: 'load-matchdays' }),
      }),
    ).then((res) => res.items.map(mapMatchday));
  }
}

function mapMatchday(raw: MatchdayHttpV1): BackofficeMatchday {
  return {
    id: raw.id,
    name: raw.name,
    scheduledAt: raw.scheduledAt,
    seasonId: raw.seasonId,
    status: raw.status,
  };
}
