import { computed, inject, Injectable, signal } from '@angular/core';

import type { BackofficeMatchday } from '@features/backoffice/domain/entities/backoffice-matchday';
import {
  toBackofficeMatchdayRowViewModel,
  type BackofficeMatchdayRowViewModel,
} from '../models/backoffice-matchdays.viewmodel';
import { LOAD_BACKOFFICE_MATCHDAYS_USE_CASE } from '../providers/backoffice.providers';

@Injectable()
export class BackofficeMatchdaysStore {
  private readonly loadMatchdaysUseCase = inject(LOAD_BACKOFFICE_MATCHDAYS_USE_CASE);

  readonly matchdays = signal<readonly BackofficeMatchday[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private _loaded = false;

  readonly rows = computed<readonly BackofficeMatchdayRowViewModel[]>(() =>
    this.matchdays().map(toBackofficeMatchdayRowViewModel),
  );

  readonly currentMatchday = computed(
    () => this.matchdays().find((m) => m.status === 'in_progress') ?? null,
  );

  readonly nextMatchday = computed(
    () => this.matchdays().find((m) => m.status === 'scheduled') ?? null,
  );

  async load(): Promise<void> {
    if (this._loaded) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.matchdays.set(await this.loadMatchdaysUseCase.execute());
      this._loaded = true;
    } catch {
      this.errorMessage.set('No hemos podido cargar las jornadas.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
