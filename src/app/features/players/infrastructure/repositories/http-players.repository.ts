import { inject, Injectable } from '@angular/core';

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
      ]).then(([teams, players]) => mapPlayersFromHttp(players, teams));

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
