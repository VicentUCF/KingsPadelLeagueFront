import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
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
  private readonly loadLineupsUseCase = inject(LoadBackofficeLineupsUseCase);
  private readonly teamsStore = inject(BackofficeTeamsStore);
  private readonly matchdaysStore = inject(BackofficeMatchdaysStore);

  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly lineups = signal<readonly BackofficeLineup[]>([]);
  readonly pairs = signal<readonly BackofficeLineupPair[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = signal(false);

  private _loaded = false;

  readonly rows = computed<readonly BackofficeStandingRow[]>(() =>
    toBackofficeStandingsViewModel(
      this.teamsStore.teams(),
      this.matches(),
      this.lineups(),
      this.pairs(),
    ),
  );

  readonly finishedMatchdayCount = computed(
    () => this.matchdaysStore.matchdays().filter((md) => md.status === 'finished').length,
  );

  readonly currentMatchday = computed(() => this.matchdaysStore.currentMatchday());

  async load(forceRefresh = false): Promise<void> {
    if (this._loaded && !forceRefresh) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await Promise.all([
        this.teamsStore.load(forceRefresh),
        this.matchdaysStore.load(forceRefresh),
      ]);

      const finishedIds = this.matchdaysStore
        .matchdays()
        .filter((md) => md.status === 'finished')
        .map((md) => md.id);

      const chunks = await Promise.all(
        finishedIds.map((id) => this.loadMatchesUseCase.byMatchday(id)),
      );
      const matches = chunks.flat();

      this.matches.set(matches);

      if (matches.length > 0) {
        const lineups = await this.loadLineupsUseCase.byMatchIds(matches.map((match) => match.id));
        this.lineups.set(lineups);

        if (lineups.length > 0) {
          this.pairs.set(await this.loadLineupsUseCase.pairsByLineupIds(lineups.map((l) => l.id)));
        } else {
          this.pairs.set([]);
        }
      } else {
        this.lineups.set([]);
        this.pairs.set([]);
      }

      this._loaded = true;
      this.hasContent.set(true);
    } catch {
      this.errorMessage.set('No se pudo cargar la clasificación.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
