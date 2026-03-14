import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import {
  toBackofficeStandingsViewModel,
  type BackofficeStandingRow,
} from '../models/backoffice-standings.viewmodel';
import { BackofficeMatchdaysStore } from './backoffice-matchdays.store';
import { BackofficeTeamsStore } from './backoffice-teams.store';

@Injectable()
export class BackofficeStandingsStore {
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);
  private readonly teamsStore = inject(BackofficeTeamsStore);
  private readonly matchdaysStore = inject(BackofficeMatchdaysStore);

  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private _loaded = false;

  readonly rows = computed<readonly BackofficeStandingRow[]>(() =>
    toBackofficeStandingsViewModel(this.teamsStore.teams(), this.matches()),
  );

  readonly finishedMatchdayCount = computed(
    () => this.matchdaysStore.matchdays().filter((md) => md.status === 'finished').length,
  );

  readonly currentMatchday = computed(() => this.matchdaysStore.currentMatchday());

  async load(): Promise<void> {
    if (this._loaded) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await Promise.all([this.teamsStore.load(), this.matchdaysStore.load()]);

      const finishedIds = this.matchdaysStore
        .matchdays()
        .filter((md) => md.status === 'finished')
        .map((md) => md.id);

      const chunks = await Promise.all(
        finishedIds.map((id) => this.loadMatchesUseCase.byMatchday(id)),
      );

      this.matches.set(chunks.flat());
      this._loaded = true;
    } catch {
      this.errorMessage.set('No se pudo cargar la clasificación.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
