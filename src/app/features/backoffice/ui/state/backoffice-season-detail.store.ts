import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeSeasonDetail } from '../../domain/entities/backoffice-season.entity';
import { toBackofficeSeasonDetailViewModel } from '../models/backoffice-seasons.viewmodel';
import { LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE } from '../providers/backoffice-seasons.providers';

@Injectable()
export class BackofficeSeasonDetailStore {
  private readonly loadBackofficeSeasonDetailUseCase = inject(
    LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE,
  );

  readonly season = signal<BackofficeSeasonDetail | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isNotFound = signal(false);

  readonly viewModel = computed(() => {
    const season = this.season();

    return season ? toBackofficeSeasonDetailViewModel(season) : null;
  });

  async load(seasonId: string | null): Promise<void> {
    if (!seasonId) {
      this.isNotFound.set(true);
      this.season.set(null);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.isNotFound.set(false);

    try {
      const season = await this.loadBackofficeSeasonDetailUseCase.execute(seasonId);

      this.season.set(season);
      this.isNotFound.set(season === null);
    } catch {
      this.errorMessage.set('No hemos podido cargar el detalle de la season.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
