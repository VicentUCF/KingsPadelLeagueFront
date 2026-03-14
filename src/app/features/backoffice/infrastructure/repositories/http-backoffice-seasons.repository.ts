import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, SeasonHttpV1 } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';

@Injectable()
export class HttpBackofficeSeasonsRepository extends BackofficeSeasonsRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  override loadAll(): Promise<readonly BackofficeSeason[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<SeasonHttpV1>>(`${this.baseUrl}/v1/seasons`, {
        params: { limit: '50' },
        context: withHttpErrorToast({ key: 'load-seasons' }),
      }),
    ).then((res) => res.items.map(mapSeason));
  }
}

function mapSeason(raw: SeasonHttpV1): BackofficeSeason {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    startsAt: raw.startsAt,
    endsAt: raw.endsAt,
  };
}
