import { computed, inject, Injectable, signal } from '@angular/core';

import type { BackofficeSeason } from '@features/backoffice/domain/entities/backoffice-season';
import {
  toBackofficeSeasonCardViewModel,
  type BackofficeSeasonCardViewModel,
} from '../models/backoffice-seasons.viewmodel';
import { LOAD_BACKOFFICE_SEASONS_USE_CASE } from '../providers/backoffice.providers';

@Injectable()
export class BackofficeSeasonsStore {
  private readonly loadSeasonsUseCase = inject(LOAD_BACKOFFICE_SEASONS_USE_CASE);

  readonly seasons = signal<readonly BackofficeSeason[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private _loaded = false;

  readonly cards = computed<readonly BackofficeSeasonCardViewModel[]>(() =>
    this.seasons().map((season, index) => toBackofficeSeasonCardViewModel(season, 5, index === 0)),
  );

  async load(): Promise<void> {
    if (this._loaded) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.seasons.set(await this.loadSeasonsUseCase.execute());
      this._loaded = true;
    } catch {
      this.errorMessage.set('No hemos podido cargar las temporadas.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
