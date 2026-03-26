import { computed, inject, Injectable, signal } from '@angular/core';

import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { BackofficePlayerUpdate } from '@features/backoffice/application/ports/backoffice-players.repository';
import {
  type BackofficePlayerCardPrivacy,
  toBackofficePlayerCardViewModel,
  type BackofficePlayerCardViewModel,
} from '../models/backoffice-players.viewmodel';
import {
  LOAD_BACKOFFICE_PLAYERS_USE_CASE,
  UPDATE_BACKOFFICE_PLAYER_USE_CASE,
} from '../providers/backoffice.providers';

@Injectable()
export class BackofficePlayersStore {
  private readonly loadPlayersUseCase = inject(LOAD_BACKOFFICE_PLAYERS_USE_CASE);
  private readonly updatePlayerUseCase = inject(UPDATE_BACKOFFICE_PLAYER_USE_CASE);

  readonly players = signal<readonly BackofficePlayer[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = signal(false);

  private _loaded = false;

  buildCards(
    teams: readonly BackofficeTeam[],
    privacy?: BackofficePlayerCardPrivacy,
  ): readonly BackofficePlayerCardViewModel[] {
    return this.players().map((player) => {
      const team = teams.find((t) => t.id === player.teamId);
      return toBackofficePlayerCardViewModel(player, team?.name, privacy);
    });
  }

  readonly cards = computed<readonly BackofficePlayerCardViewModel[]>(() =>
    this.players().map((p) => toBackofficePlayerCardViewModel(p)),
  );

  async load(forceRefresh = false): Promise<void> {
    if (this._loaded && !forceRefresh) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.players.set(await this.loadPlayersUseCase.execute());
      this._loaded = true;
      this.hasContent.set(true);
    } catch {
      this.errorMessage.set('No hemos podido cargar los jugadores.');
    } finally {
      this.isLoading.set(false);
    }
  }

  playerById(playerId: string): BackofficePlayer | null {
    return this.players().find((player) => player.id === playerId) ?? null;
  }

  async update(playerId: string, input: BackofficePlayerUpdate): Promise<void> {
    this.isSaving.set(true);
    this.errorMessage.set(null);

    try {
      await this.updatePlayerUseCase.execute(playerId, input);
      await this.load(true);
    } catch {
      this.errorMessage.set('No hemos podido guardar los cambios del jugador.');
      throw new Error('player_update_failed');
    } finally {
      this.isSaving.set(false);
    }
  }
}
