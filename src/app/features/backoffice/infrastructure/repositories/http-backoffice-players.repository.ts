import { HttpClient, HttpParams } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { resolveCurrentSeasonId } from '@core/api/current-season-id';
import { withJsonArrayParam } from '@core/api/http-query-params';
import type {
  MatchdayHttpV1,
  PaginatedResponse,
  PlayerHttpV1,
  SeasonHttpV1,
  SeasonPlayerScoreHttpV1,
  UpdateOnePlayerHttpV1,
} from '@core/api/kings-padel-api.types';
import { resolvePlayerHttpCompetitiveStats } from '@core/api/player-http-competitive-stats';
import { withHttpErrorToast } from '@core/interceptors/http-error-toast.interceptor';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import {
  BackofficePlayersRepository,
  type BackofficePlayerUpdate,
} from '@features/backoffice/application/ports/backoffice-players.repository';
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
  private readonly seasonsBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN' ? '/admin/v1/seasons' : '/v1/seasons',
  );
  private readonly matchdaysBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN' ? '/admin/v1/matchdays' : '/v1/matchdays',
  );
  private readonly seasonPlayerScoresBasePath = computed(() =>
    this.authStore.currentRole() === 'ADMIN'
      ? '/admin/v1/season-player-scores'
      : '/v1/season-player-scores',
  );

  override async loadAll(): Promise<readonly BackofficePlayer[]> {
    const [players, seasons, matchdays] = await Promise.all([
      this.loadPlayers(),
      this.loadSeasons(),
      this.loadMatchdays(),
    ]);
    const activeSeasonId = resolveCurrentSeasonId(seasons, matchdays);
    const seasonPlayerScores = activeSeasonId
      ? await this.loadSeasonPlayerScores(activeSeasonId)
      : [];
    const seasonScoreByPlayerId = new Map(
      seasonPlayerScores.map((score) => [
        score.playerId,
        {
          totalPoints: score.totalPoints ?? 0,
          wonPairMatches: score.wonPairMatches,
          lostPairMatches: score.lostPairMatches,
        },
      ]),
    );

    return players.map((player) => mapPlayer(player, seasonScoreByPlayerId.get(player.id)));
  }

  override update(id: string, input: BackofficePlayerUpdate): Promise<void> {
    const body: UpdateOnePlayerHttpV1 = {
      ...(input.alias !== undefined ? { alias: input.alias } : {}),
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.instagramUrl !== undefined ? { instagramUrl: input.instagramUrl } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      ...(input.preferredPosition !== undefined
        ? { preferredPosition: input.preferredPosition }
        : {}),
      ...(input.profileImage !== undefined ? { profileImage: input.profileImage } : {}),
    };

    return firstValueFrom(
      this.http.patch<void>(`${this.baseUrl}/v1/players/${id}`, body, {
        context: withHttpErrorToast({ key: 'update-player' }),
      }),
    ).then(() => undefined);
  }

  private loadPlayers(): Promise<readonly PlayerHttpV1[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<PlayerHttpV1>>(`${this.baseUrl}${this.playersBasePath()}`, {
        params: { limit: '200' },
        context: withHttpErrorToast({ key: 'load-players' }),
      }),
    ).then((res) => res.items);
  }

  private loadSeasons(): Promise<readonly SeasonHttpV1[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<SeasonHttpV1>>(`${this.baseUrl}${this.seasonsBasePath()}`, {
        params: { limit: '50' },
        context: withHttpErrorToast({ key: 'load-seasons' }),
      }),
    ).then((res) => res.items);
  }

  private loadMatchdays(): Promise<readonly MatchdayHttpV1[]> {
    return firstValueFrom(
      this.http.get<PaginatedResponse<MatchdayHttpV1>>(
        `${this.baseUrl}${this.matchdaysBasePath()}`,
        {
          params: { limit: '100' },
          context: withHttpErrorToast({ key: 'load-matchdays' }),
        },
      ),
    ).then((res) => res.items);
  }

  private loadSeasonPlayerScores(seasonId: string): Promise<readonly SeasonPlayerScoreHttpV1[]> {
    const params = withJsonArrayParam(new HttpParams().set('limit', '200'), 'seasonIds', [
      seasonId,
    ]);

    return firstValueFrom(
      this.http.get<PaginatedResponse<SeasonPlayerScoreHttpV1>>(
        `${this.baseUrl}${this.seasonPlayerScoresBasePath()}`,
        {
          params,
          context: withHttpErrorToast({ key: 'load-season-player-scores' }),
        },
      ),
    ).then((res) => res.items);
  }
}

function mapPlayer(
  raw: PlayerHttpV1,
  seasonScore?: {
    readonly totalPoints: number;
    readonly wonPairMatches: number;
    readonly lostPairMatches: number;
  },
): BackofficePlayer {
  const competitiveStats = resolvePlayerHttpCompetitiveStats(raw, seasonScore);

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
    totalPoints: competitiveStats.totalPoints,
    wonGames: competitiveStats.wonMatchesCount,
    lostGames: competitiveStats.lostMatchesCount,
    preferredPosition: raw.preferredPosition,
    description: raw.description,
    ...(raw.instagramUrl != null ? { instagramUrl: raw.instagramUrl } : {}),
  };
}
