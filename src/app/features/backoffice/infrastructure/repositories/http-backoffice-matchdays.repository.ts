import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { MatchdayHttpV1, PaginatedResponse } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import {
  BackofficeMatchdaysRepository,
  type CreateBackofficeMatchdayInput,
} from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';

@Injectable()
export class HttpBackofficeMatchdaysRepository extends BackofficeMatchdaysRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly matchdaysBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN' ? '/admin/v1/matchdays' : '/v1/matchdays',
  );

  override loadAll(): Promise<readonly BackofficeMatchday[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchdayHttpV1>>(
        `${this.baseUrl}${this.matchdaysBasePath()}`,
        {
          params: { limit: '100' },
          context: withHttpErrorToast({ key: 'load-matchdays' }),
        },
      ),
    ).then((res) => res.items.map(mapMatchday));
  }

  override create(input: CreateBackofficeMatchdayInput): Promise<BackofficeMatchday> {
    return firstValueFrom(
      this.http.post<MatchdayHttpV1>(`${this.baseUrl}/admin/v1/matchdays`, input, {
        context: withHttpErrorToast({ key: 'create-matchday' }),
      }),
    ).then(mapMatchday);
  }

  override start(matchdayId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/admin/v1/matchdays/${matchdayId}/starts`, null, {
        context: withHttpErrorToast({ key: 'start-matchday' }),
      }),
    ).then(() => undefined);
  }

  override finish(matchdayId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(`${this.baseUrl}/admin/v1/matchdays/${matchdayId}/finishes`, null, {
        context: withHttpErrorToast({ key: 'finish-matchday' }),
      }),
    ).then(() => undefined);
  }

  override createPairMatches(matchdayId: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.baseUrl}/admin/v1/matchdays/${matchdayId}/create-pair-matches`,
        null,
        {
          context: withHttpErrorToast({ key: 'create-pair-matches' }),
        },
      ),
    ).then(() => undefined);
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
