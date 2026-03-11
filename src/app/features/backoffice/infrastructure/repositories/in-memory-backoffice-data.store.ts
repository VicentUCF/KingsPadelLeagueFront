import { Injectable } from '@angular/core';

import { INITIAL_IN_MEMORY_BACKOFFICE_STATE } from './in-memory-backoffice-data.seed';
import {
  type InMemoryBackofficePlayerRecord,
  type InMemoryBackofficeSeasonRecord,
  type InMemoryBackofficeState,
  type InMemoryBackofficeTeamRecord,
} from './in-memory-backoffice-data.types';

@Injectable({
  providedIn: 'root',
})
export class InMemoryBackofficeDataStore {
  private state = cloneState(INITIAL_IN_MEMORY_BACKOFFICE_STATE);

  getSeasons(): readonly InMemoryBackofficeSeasonRecord[] {
    return this.state.seasons;
  }

  setSeasons(seasons: readonly InMemoryBackofficeSeasonRecord[]): void {
    this.state = {
      ...this.state,
      seasons: cloneState(seasons),
    };
  }

  getTeams(): readonly InMemoryBackofficeTeamRecord[] {
    return this.state.teams;
  }

  setTeams(teams: readonly InMemoryBackofficeTeamRecord[]): void {
    this.state = {
      ...this.state,
      teams: cloneState(teams),
    };
  }

  getPlayers(): readonly InMemoryBackofficePlayerRecord[] {
    return this.state.players;
  }

  setPlayers(players: readonly InMemoryBackofficePlayerRecord[]): void {
    this.state = {
      ...this.state,
      players: cloneState(players),
    };
  }

  snapshot(): InMemoryBackofficeState {
    return cloneState(this.state);
  }
}

function cloneState<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
