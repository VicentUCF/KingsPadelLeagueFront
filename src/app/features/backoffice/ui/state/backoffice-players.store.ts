import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficePlayerSummary } from '../../domain/entities/backoffice-player.entity';
import { toBackofficePlayerCardViewModel } from '../models/backoffice-players.viewmodel';
import { LOAD_BACKOFFICE_PLAYERS_USE_CASE } from '../providers/backoffice-players.providers';

@Injectable()
export class BackofficePlayersStore {
  private readonly loadBackofficePlayersUseCase = inject(LOAD_BACKOFFICE_PLAYERS_USE_CASE);

  readonly players = signal<readonly BackofficePlayerSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.players().map(toBackofficePlayerCardViewModel));

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.players.set(await this.loadBackofficePlayersUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar el directorio de jugadores.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
