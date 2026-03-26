import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { withJsonArrayParam } from '@core/api/http-query-params';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, SeasonPlayerScoreHttpV1 } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BackofficeSeasonPlayerScoresRepository } from '@features/backoffice/application/ports/backoffice-season-player-scores.repository';
import type { BackofficeSeasonPlayerScore } from '@features/backoffice/domain/entities/backoffice-season-player-score';

@Injectable()
export class HttpBackofficeSeasonPlayerScoresRepository extends BackofficeSeasonPlayerScoresRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly scoresBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN'
      ? '/admin/v1/season-player-scores'
      : '/v1/season-player-scores',
  );

  override loadBySeasonId(seasonId: string): Promise<readonly BackofficeSeasonPlayerScore[]> {
    const params = withJsonArrayParam(new HttpParams().set('limit', '200'), 'seasonIds', [
      seasonId,
    ]);

    return firstValueFrom(
      this.http.get<PaginatedResponse<SeasonPlayerScoreHttpV1>>(
        `${this.baseUrl}${this.scoresBasePath()}`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-season-player-scores' }),
        },
      ),
    ).then((res) => res.items.map(mapSeasonPlayerScore));
  }
}

function mapSeasonPlayerScore(raw: SeasonPlayerScoreHttpV1): BackofficeSeasonPlayerScore {
  return {
    id: raw.id,
    seasonId: raw.seasonId,
    playerId: raw.playerId,
    wonGames: raw.wonGames,
    lostGames: raw.lostGames,
    wonPairMatches: raw.wonPairMatches,
    lostPairMatches: raw.lostPairMatches,
    wonSets: raw.wonSets,
    lostSets: raw.lostSets,
  };
}
