import { computed, inject, Injectable, signal } from '@angular/core';

import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import {
  toBackofficeMatchdayRowViewModel,
  type BackofficeMatchdayRowViewModel,
} from '../models/backoffice-matchdays.viewmodel';
import { LOAD_BACKOFFICE_MATCHDAYS_USE_CASE } from '../providers/backoffice.providers';

@Injectable()
export class BackofficeMatchdaysStore {
  private readonly loadMatchdaysUseCase = inject(LOAD_BACKOFFICE_MATCHDAYS_USE_CASE);
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);

  readonly matchdays = signal<readonly BackofficeMatchday[]>([]);
  readonly summaries = signal<
    Readonly<
      Record<
        string,
        {
          readonly matchCount: number;
          readonly completedResultsCount: number;
          readonly totalResultsCount: number;
        }
      >
    >
  >({});
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = signal(false);

  private _loaded = false;

  readonly rows = computed<readonly BackofficeMatchdayRowViewModel[]>(() =>
    this.matchdays().map((matchday) =>
      toBackofficeMatchdayRowViewModel(matchday, this.summaries()[matchday.id]),
    ),
  );

  readonly currentMatchday = computed(
    () => this.matchdays().find((m) => m.status === 'in_progress') ?? null,
  );

  readonly nextMatchday = computed(
    () => this.matchdays().find((m) => m.status === 'scheduled') ?? null,
  );

  async load(forceRefresh = false): Promise<void> {
    if (this._loaded && !forceRefresh) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const matchdays = await this.loadMatchdaysUseCase.execute();
      this.matchdays.set(matchdays);
      this.summaries.set(await this.loadSummaries(matchdays));
      this._loaded = true;
      this.hasContent.set(true);
    } catch {
      this.errorMessage.set('No hemos podido cargar las jornadas.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private async loadSummaries(matchdays: readonly BackofficeMatchday[]) {
    // TODO: Replace this with API-provided summary counters when the list endpoint exposes them.
    const summaryEntries = await Promise.all(
      matchdays.map(async (matchday) => {
        const matches = await this.loadMatchesUseCase.byMatchday(matchday.id);
        const completedResultsCount = matches.filter((match) => match.status === 'finished').length;

        return [
          matchday.id,
          {
            matchCount: matches.length,
            completedResultsCount,
            totalResultsCount: matches.length,
          },
        ] as const;
      }),
    );

    return Object.fromEntries(summaryEntries);
  }
}
