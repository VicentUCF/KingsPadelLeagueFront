import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { withJsonArrayParam } from '@core/api/http-query-params';
import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, SeasonTeamScoreHttpV1 } from '@core/api/kings-padel-api.types';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BackofficeSeasonTeamScoresRepository } from '@features/backoffice/application/ports/backoffice-season-team-scores.repository';
import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';

@Injectable()
export class HttpBackofficeSeasonTeamScoresRepository extends BackofficeSeasonTeamScoresRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly scoresBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN'
      ? '/admin/v1/season-team-scores'
      : '/v1/season-team-scores',
  );

  override loadBySeasonId(seasonId: string): Promise<readonly BackofficeSeasonTeamScore[]> {
    const params = withJsonArrayParam(new HttpParams().set('limit', '50'), 'seasonIds', [seasonId]);

    return firstValueFrom(
      this.http.get<PaginatedResponse<SeasonTeamScoreHttpV1>>(
        `${this.baseUrl}${this.scoresBasePath()}`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-season-team-scores' }),
        },
      ),
    ).then((res) => res.items.map(mapSeasonTeamScore));
  }
}

function mapSeasonTeamScore(raw: SeasonTeamScoreHttpV1): BackofficeSeasonTeamScore {
  return {
    id: raw.id,
    seasonId: raw.seasonId,
    teamId: raw.teamId,
    totalPoints: raw.totalPoints,
    wonMatches: raw.wonMatches,
    lostMatches: raw.lostMatches,
    wonGames: raw.wonGames,
    lostGames: raw.lostGames,
    wonSets: raw.wonSets,
    lostSets: raw.lostSets,
  };
}
