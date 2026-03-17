import { inject, Injectable } from '@angular/core';

import { KingsPadelApiClient } from '@core/api/kings-padel-api.client';

import { LeagueHomeRepository } from '../../application/ports/league-home.repository';
import type { LeagueMatchday } from '../../domain/entities/league-matchday';
import type { LeagueHomeSnapshot } from '../../domain/entities/league-home-snapshot';
import {
  mapLeagueHomeSnapshot,
  mapLeagueMatchdays,
  type LeagueHomeHttpDataset,
} from '../mappers/league-home-http.mapper';

@Injectable()
export class HttpLeagueHomeRepository extends LeagueHomeRepository {
  private readonly apiClient = inject(KingsPadelApiClient);

  private datasetPromise: Promise<LeagueHomeHttpDataset> | null = null;

  override async loadSnapshot(forceRefresh = false): Promise<LeagueHomeSnapshot> {
    return mapLeagueHomeSnapshot(await this.loadDataset(forceRefresh));
  }

  override async loadMatchdays(forceRefresh = false): Promise<readonly LeagueMatchday[]> {
    return mapLeagueMatchdays(await this.loadDataset(forceRefresh));
  }

  private loadDataset(forceRefresh: boolean): Promise<LeagueHomeHttpDataset> {
    if (forceRefresh || this.datasetPromise === null) {
      const request = Promise.all([
        this.apiClient.loadTeams(forceRefresh),
        this.apiClient.loadPlayers(forceRefresh),
        this.apiClient.loadMatchdays(forceRefresh),
        this.apiClient.loadMatches(forceRefresh),
        this.apiClient.loadLineups(forceRefresh),
        this.apiClient.loadLineupPairs(forceRefresh),
        this.apiClient.loadPairMatches(forceRefresh),
      ]).then(([teams, players, matchdays, matches, lineups, lineupPairs, pairMatches]) => ({
        teams,
        players,
        matchdays,
        matches,
        lineups,
        lineupPairs,
        pairMatches,
      }));

      this.datasetPromise = request;
      request.catch(() => {
        if (this.datasetPromise === request) {
          this.datasetPromise = null;
        }
      });
    }

    return this.datasetPromise;
  }
}
