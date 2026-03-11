import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ActionToastStore } from '@core/state/action-toast.store';

import { type BackofficeSeasonSummary } from '../../domain/entities/backoffice-season.entity';
import { type BackofficeSeasonFormValue } from '../models/backoffice-crud.model';
import { toBackofficeSeasonCardViewModel } from '../models/backoffice-seasons.viewmodel';
import {
  CREATE_BACKOFFICE_SEASON_USE_CASE,
  LOAD_BACKOFFICE_SEASONS_USE_CASE,
} from '../providers/backoffice-seasons.providers';

@Injectable()
export class BackofficeSeasonsStore {
  private readonly loadBackofficeSeasonsUseCase = inject(LOAD_BACKOFFICE_SEASONS_USE_CASE);
  private readonly createBackofficeSeasonUseCase = inject(CREATE_BACKOFFICE_SEASON_USE_CASE);
  private readonly router = inject(Router);
  private readonly actionToastStore = inject(ActionToastStore);

  readonly seasons = signal<readonly BackofficeSeasonSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isCreateDialogOpen = signal(false);
  readonly isSubmittingCreate = signal(false);
  readonly createErrorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.seasons().map(toBackofficeSeasonCardViewModel));
  readonly createFormValue = computed<BackofficeSeasonFormValue>(() => {
    const nextSeasonYear =
      this.seasons().reduce((maxYear, season) => Math.max(maxYear, season.year), 2025) + 1;

    return {
      name: `Temporada ${nextSeasonYear}`,
      year: nextSeasonYear,
      startDate: `${nextSeasonYear}-03-01`,
      endDate: `${nextSeasonYear}-06-30`,
      notes: [],
      status: 'DRAFT',
    };
  });

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

  openCreateDialog(): void {
    this.createErrorMessage.set(null);
    this.isCreateDialogOpen.set(true);
  }

  closeCreateDialog(): void {
    this.createErrorMessage.set(null);
    this.isCreateDialogOpen.set(false);
  }

  async createSeason(formValue: BackofficeSeasonFormValue): Promise<void> {
    this.isSubmittingCreate.set(true);
    this.createErrorMessage.set(null);

    try {
      const createdSeason = await this.createBackofficeSeasonUseCase.execute({
        ...formValue,
        status: 'DRAFT',
      });

      await this.load();
      this.closeCreateDialog();
      this.actionToastStore.success(
        `La season ${createdSeason.name} ya está disponible.`,
        'Season creada',
      );
      await this.router.navigate(['/backoffice/temporadas', createdSeason.id]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No hemos podido crear la season.';

      this.createErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingCreate.set(false);
    }
  }
}
