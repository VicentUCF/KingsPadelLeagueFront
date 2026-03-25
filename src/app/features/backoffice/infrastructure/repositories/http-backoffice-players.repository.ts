import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, PlayerHttpV1 } from '@core/api/kings-padel-api.types';
import { resolvePlayerHttpCompetitiveStats } from '@core/api/player-http-competitive-stats';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BackofficePlayersRepository } from '@features/backoffice/application/ports/backoffice-players.repository';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';

@Injectable()
export class HttpBackofficePlayersRepository extends BackofficePlayersRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly authStore = inject(AuthStore);
  private readonly playersBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN' ? '/admin/v1/players' : '/v1/players',
  );

  override loadAll(): Promise<readonly BackofficePlayer[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<PlayerHttpV1>>(`${this.baseUrl}${this.playersBasePath()}`, {
        params: { limit: '200' },
        context: withHttpErrorToast({ key: 'load-players' }),
      }),
    ).then((res) => res.items.map(mapPlayer));
  }
}

function mapPlayer(raw: PlayerHttpV1): BackofficePlayer {
  const competitiveStats = resolvePlayerHttpCompetitiveStats(raw);

  return {
    id: raw.id,
    firstName: raw.firstName,
    lastName: raw.lastName,
    ...(raw.alias != null ? { alias: raw.alias } : {}),
    email: raw.email,
    profileImage: resolvePlayerAvatarPath(raw.profileImage),
    isPresident: raw.isPresident,
    ...(raw.teamId != null ? { teamId: raw.teamId } : {}),
    value: competitiveStats.marketValue,
    wonGames: competitiveStats.wonMatchesCount,
    lostGames: competitiveStats.lostMatchesCount,
    preferredPosition: raw.preferredPosition,
    description: raw.description,
    ...(raw.instagramUrl != null ? { instagramUrl: raw.instagramUrl } : {}),
  };
}
