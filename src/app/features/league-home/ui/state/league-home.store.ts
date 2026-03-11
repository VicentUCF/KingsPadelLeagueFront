import { computed, inject, Injectable, signal } from '@angular/core';

import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';
import {
  toLeagueHomeViewModel,
  type LeagueHomeViewModel,
} from '@features/league-home/ui/models/league-home.viewmodel';
import { LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE } from '@features/league-home/ui/providers/league-home.providers';

@Injectable()
export class LeagueHomeStore {
  private readonly loadLeagueHomeSnapshotUseCase = inject(LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE);

  readonly snapshot = signal<LeagueHomeSnapshot | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasSnapshot = computed(() => this.snapshot() !== null);
  readonly viewModel = computed<LeagueHomeViewModel | null>(() => {
    const snapshot = this.snapshot();

    return snapshot ? toLeagueHomeViewModel(snapshot) : null;
  });

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.snapshot.set(await this.loadLeagueHomeSnapshotUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar el estado actual de la liga.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
