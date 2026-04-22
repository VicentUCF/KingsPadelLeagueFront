import { inject, Injectable } from '@angular/core';

import { resolveCurrentSeasonId } from '@core/api/current-season-id';
import { KingsPadelApiClient } from '@core/api/kings-padel-api.client';
import { type Player } from '@features/players/domain/entities/player.entity';

import { PlayersRepository } from '../../application/ports/players.repository';
import { mapPlayersFromHttp } from '../mappers/player-http.mapper';

@Injectable()
export class HttpPlayersRepository extends PlayersRepository {
  private readonly apiClient = inject(KingsPadelApiClient);

  private playersPromise: Promise<readonly Player[]> | null = null;

  override findAll(forceRefresh = false): Promise<readonly Player[]> {
    return this.loadPlayers(forceRefresh);
  }

  override async findBySlug(slug: string, forceRefresh = false): Promise<Player | null> {
    const players = await this.loadPlayers(forceRefresh);

    return players.find((player) => player.slug === slug) ?? null;
  }

  private loadPlayers(forceRefresh: boolean): Promise<readonly Player[]> {
    if (forceRefresh || this.playersPromise === null) {
      const request = Promise.all([
        this.apiClient.loadTeams(forceRefresh),
        this.apiClient.loadPlayers(forceRefresh),
        this.apiClient.loadSeasons(forceRefresh),
        this.apiClient.loadMatchdays(forceRefresh),
      ]).then(async ([teams, players, seasons, matchdays]) => {
        const activeSeasonId = resolveCurrentSeasonId(seasons, matchdays);
        const seasonPlayerScores = activeSeasonId
          ? await this.apiClient.loadSeasonPlayerScores(activeSeasonId, forceRefresh)
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

        return mapPlayersFromHttp(players, teams, seasonScoreByPlayerId);
      });

      this.playersPromise = request;
      request.catch(() => {
        if (this.playersPromise === request) {
          this.playersPromise = null;
        }
      });
    }

    return this.playersPromise;
  }
}
