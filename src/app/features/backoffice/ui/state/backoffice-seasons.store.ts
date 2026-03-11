import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeSeasonSummary } from '../../domain/entities/backoffice-season.entity';
import { toBackofficeSeasonCardViewModel } from '../models/backoffice-seasons.viewmodel';
import { LOAD_BACKOFFICE_SEASONS_USE_CASE } from '../providers/backoffice-seasons.providers';

@Injectable()
export class BackofficeSeasonsStore {
  private readonly loadBackofficeSeasonsUseCase = inject(LOAD_BACKOFFICE_SEASONS_USE_CASE);

  readonly seasons = signal<readonly BackofficeSeasonSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.seasons().map(toBackofficeSeasonCardViewModel));

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.seasons.set(await this.loadBackofficeSeasonsUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar el listado de seasons.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
