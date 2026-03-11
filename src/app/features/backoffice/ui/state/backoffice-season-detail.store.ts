import { computed, inject, Injectable, signal } from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';

import { type BackofficeSeasonDetail } from '../../domain/entities/backoffice-season.entity';
import { type ChangeStatusBackofficeSeasonCommand } from '../../application/commands/backoffice-season.commands';
import {
  type BackofficeConfirmDialogConfig,
  type BackofficeSeasonFormValue,
} from '../models/backoffice-crud.model';
import { toBackofficeSeasonDetailViewModel } from '../models/backoffice-seasons.viewmodel';
import {
  CHANGE_BACKOFFICE_SEASON_STATUS_USE_CASE,
  LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE,
  UPDATE_BACKOFFICE_SEASON_USE_CASE,
} from '../providers/backoffice-seasons.providers';

export interface BackofficeSeasonStatusAction {
  readonly label: string;
  readonly targetStatus: ChangeStatusBackofficeSeasonCommand['targetStatus'];
  readonly tone: 'neutral' | 'danger';
}

@Injectable()
export class BackofficeSeasonDetailStore {
  private readonly loadBackofficeSeasonDetailUseCase = inject(
    LOAD_BACKOFFICE_SEASON_DETAIL_USE_CASE,
  );
  private readonly updateBackofficeSeasonUseCase = inject(UPDATE_BACKOFFICE_SEASON_USE_CASE);
  private readonly changeBackofficeSeasonStatusUseCase = inject(
    CHANGE_BACKOFFICE_SEASON_STATUS_USE_CASE,
  );
  private readonly actionToastStore = inject(ActionToastStore);

  readonly season = signal<BackofficeSeasonDetail | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isNotFound = signal(false);
  readonly isEditDialogOpen = signal(false);
  readonly isSubmittingEdit = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  readonly pendingStatusTarget = signal<ChangeStatusBackofficeSeasonCommand['targetStatus'] | null>(
    null,
  );
  readonly confirmDialog = signal<BackofficeConfirmDialogConfig | null>(null);

  readonly viewModel = computed(() => {
    const season = this.season();

    return season ? toBackofficeSeasonDetailViewModel(season) : null;
  });
  readonly canEdit = computed(() => {
    const season = this.season();

    return season?.status === 'DRAFT' || season?.status === 'ACTIVE';
  });
  readonly editFormValue = computed<BackofficeSeasonFormValue | null>(() => {
    const season = this.season();

    if (!season) {
      return null;
    }

    return {
      name: season.name,
      year: season.year,
      startDate: season.startDate,
      endDate: season.endDate,
      notes: season.notes,
      status: season.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT',
    };
  });
  readonly statusActions = computed<readonly BackofficeSeasonStatusAction[]>(() => {
    const season = this.season();

    if (!season) {
      return [];
    }

    switch (season.status) {
      case 'DRAFT':
        return [
          { label: 'Activar season', targetStatus: 'ACTIVE', tone: 'neutral' },
          { label: 'Archivar season', targetStatus: 'ARCHIVED', tone: 'danger' },
        ];
      case 'ACTIVE':
        return [
          { label: 'Finalizar season', targetStatus: 'FINISHED', tone: 'neutral' },
          { label: 'Archivar season', targetStatus: 'ARCHIVED', tone: 'danger' },
        ];
      case 'FINISHED':
        return [{ label: 'Archivar season', targetStatus: 'ARCHIVED', tone: 'danger' }];
      case 'ARCHIVED':
        return [];
    }
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
    this.isEditDialogOpen.set(false);
    this.editErrorMessage.set(null);
    this.confirmDialog.set(null);
    this.pendingStatusTarget.set(null);

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

  openEditDialog(): void {
    if (!this.canEdit()) {
      return;
    }

    this.editErrorMessage.set(null);
    this.isEditDialogOpen.set(true);
  }

  closeEditDialog(): void {
    this.editErrorMessage.set(null);
    this.isEditDialogOpen.set(false);
  }

  openStatusDialog(action: BackofficeSeasonStatusAction): void {
    const season = this.season();

    if (!season) {
      return;
    }

    this.pendingStatusTarget.set(action.targetStatus);
    this.confirmDialog.set({
      title: action.label,
      description: createSeasonStatusDialogDescription(season.name, action.targetStatus),
      confirmLabel: action.label,
      confirmTone: action.tone,
    });
  }

  closeStatusDialog(): void {
    this.confirmDialog.set(null);
    this.pendingStatusTarget.set(null);
  }

  async updateSeason(formValue: BackofficeSeasonFormValue): Promise<void> {
    const season = this.season();

    if (!season) {
      return;
    }

    this.isSubmittingEdit.set(true);
    this.editErrorMessage.set(null);

    try {
      const updatedSeason = await this.updateBackofficeSeasonUseCase.execute({
        id: season.id,
        ...formValue,
      });

      await this.load(updatedSeason.id);
      this.actionToastStore.success(
        `Los cambios de ${updatedSeason.name} se han guardado.`,
        'Season actualizada',
      );
      this.closeEditDialog();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No hemos podido actualizar la season.';

      this.editErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }

  async confirmStatusChange(): Promise<void> {
    const season = this.season();
    const targetStatus = this.pendingStatusTarget();

    if (!season || !targetStatus) {
      return;
    }

    this.isSubmittingEdit.set(true);

    try {
      const updatedSeason = await this.changeBackofficeSeasonStatusUseCase.execute({
        seasonId: season.id,
        targetStatus,
      });

      await this.load(updatedSeason.id);
      this.actionToastStore.success(
        createSeasonStatusSuccessMessage(updatedSeason.name, targetStatus),
        'Estado actualizado',
      );
      this.closeStatusDialog();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No hemos podido actualizar el estado de la season.';

      this.actionToastStore.error(message);
      this.editErrorMessage.set(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }
}

function createSeasonStatusDialogDescription(
  seasonName: string,
  targetStatus: ChangeStatusBackofficeSeasonCommand['targetStatus'],
): string {
  switch (targetStatus) {
    case 'ACTIVE':
      return `Vas a activar ${seasonName}. Esta acción bloqueará la activación de cualquier otra season mientras siga activa.`;
    case 'FINISHED':
      return `Vas a finalizar ${seasonName}. La operativa seguirá visible, pero la season dejará de estar activa.`;
    case 'ARCHIVED':
      return `Vas a archivar ${seasonName}. El detalle quedará solo para consulta histórica.`;
  }
}

function createSeasonStatusSuccessMessage(
  seasonName: string,
  targetStatus: ChangeStatusBackofficeSeasonCommand['targetStatus'],
): string {
  switch (targetStatus) {
    case 'ACTIVE':
      return `${seasonName} ya es la season activa.`;
    case 'FINISHED':
      return `${seasonName} ha quedado finalizada.`;
    case 'ARCHIVED':
      return `${seasonName} ha quedado archivada.`;
  }
}
