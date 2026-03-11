import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficePlayerDetail } from '../../domain/entities/backoffice-player.entity';
import { toBackofficePlayerDetailViewModel } from '../models/backoffice-players.viewmodel';
import { LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE } from '../providers/backoffice-players.providers';

@Injectable()
export class BackofficePlayerDetailStore {
  private readonly loadBackofficePlayerDetailUseCase = inject(
    LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE,
  );

  readonly player = signal<BackofficePlayerDetail | null>(null);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => {
    const player = this.player();

    return player ? toBackofficePlayerDetailViewModel(player) : null;
  });

  async load(playerId: string | null): Promise<void> {
    if (!playerId) {
      this.isNotFound.set(true);
      this.player.set(null);
      return;
    }

    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.errorMessage.set(null);

    try {
      const player = await this.loadBackofficePlayerDetailUseCase.execute(playerId);

      this.player.set(player);
      this.isNotFound.set(player === null);
    } catch {
      this.errorMessage.set('No hemos podido cargar el detalle del jugador.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
