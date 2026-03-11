import { computed, inject, Injectable, signal } from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';

import {
  DEFAULT_BACKOFFICE_TEAM_TAB,
  toBackofficeTeamDetailViewModel,
} from '../models/backoffice-teams.viewmodel';
import { type ChangeStatusBackofficeTeamCommand } from '../../application/commands/backoffice-team.commands';
import {
  type BackofficeTeamDetail,
  type BackofficeTeamTabId,
} from '../../domain/entities/backoffice-team.entity';
import {
  CHANGE_BACKOFFICE_TEAM_STATUS_USE_CASE,
  LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE,
  UPDATE_BACKOFFICE_TEAM_USE_CASE,
} from '../providers/backoffice-teams.providers';
import {
  type BackofficeConfirmDialogConfig,
  type BackofficeTeamFormValue,
} from '../models/backoffice-crud.model';

export interface BackofficeTeamStatusAction {
  readonly label: string;
  readonly targetStatus: ChangeStatusBackofficeTeamCommand['targetStatus'];
}

@Injectable()
export class BackofficeTeamDetailStore {
  private readonly loadBackofficeTeamDetailUseCase = inject(LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE);
  private readonly updateBackofficeTeamUseCase = inject(UPDATE_BACKOFFICE_TEAM_USE_CASE);
  private readonly changeBackofficeTeamStatusUseCase = inject(
    CHANGE_BACKOFFICE_TEAM_STATUS_USE_CASE,
  );
  private readonly actionToastStore = inject(ActionToastStore);

  readonly team = signal<BackofficeTeamDetail | null>(null);
  readonly selectedTab = signal<BackofficeTeamTabId>(DEFAULT_BACKOFFICE_TEAM_TAB);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly isEditDialogOpen = signal(false);
  readonly isSubmittingEdit = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  readonly confirmDialog = signal<BackofficeConfirmDialogConfig | null>(null);
  readonly pendingStatusTarget = signal<ChangeStatusBackofficeTeamCommand['targetStatus'] | null>(
    null,
  );

  readonly viewModel = computed(() => {
    const team = this.team();

    return team ? toBackofficeTeamDetailViewModel(team) : null;
  });
  readonly canEdit = computed(() => this.team()?.status !== 'ARCHIVED');
  readonly editFormValue = computed<BackofficeTeamFormValue | null>(() => {
    const team = this.team();

    if (!team) {
      return null;
    }

    return {
      name: team.name,
      shortName: team.shortName,
      presidentName: team.presidentName,
      primaryColor: team.primaryColor,
      secondaryColor: team.secondaryColor,
    };
  });
  readonly statusActions = computed<readonly BackofficeTeamStatusAction[]>(() => {
    const team = this.team();

    if (!team) {
      return [];
    }

    switch (team.status) {
      case 'ACTIVE':
        return [{ label: 'Inactivar equipo', targetStatus: 'INACTIVE' }];
      case 'INACTIVE':
        return [{ label: 'Archivar equipo', targetStatus: 'ARCHIVED' }];
      case 'ARCHIVED':
        return [];
    }
  });

  setSelectedTab(tabId: BackofficeTeamTabId): void {
    this.selectedTab.set(tabId);
  }

  async load(teamId: string | null): Promise<void> {
    if (!teamId) {
      this.isNotFound.set(true);
      this.team.set(null);
      return;
    }

    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.errorMessage.set(null);
    this.isEditDialogOpen.set(false);
    this.editErrorMessage.set(null);
    this.confirmDialog.set(null);
    this.pendingStatusTarget.set(null);

    try {
      const team = await this.loadBackofficeTeamDetailUseCase.execute(teamId);

      this.team.set(team);
      this.isNotFound.set(team === null);
      this.selectedTab.set(DEFAULT_BACKOFFICE_TEAM_TAB);
    } catch {
      this.errorMessage.set('No hemos podido cargar el detalle del equipo.');
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

  openStatusDialog(action: BackofficeTeamStatusAction): void {
    const team = this.team();

    if (!team) {
      return;
    }

    this.pendingStatusTarget.set(action.targetStatus);
    this.confirmDialog.set({
      title: action.label,
      description:
        action.targetStatus === 'INACTIVE'
          ? `Vas a marcar ${team.name} como inactivo. Seguirá visible, pero dejará de operar como equipo activo.`
          : `Vas a archivar ${team.name}. El detalle quedará solo para consulta histórica.`,
      confirmLabel: action.label,
      confirmTone: 'danger',
    });
  }

  closeStatusDialog(): void {
    this.confirmDialog.set(null);
    this.pendingStatusTarget.set(null);
  }

  async updateTeam(formValue: BackofficeTeamFormValue): Promise<void> {
    const team = this.team();

    if (!team) {
      return;
    }

    this.isSubmittingEdit.set(true);
    this.editErrorMessage.set(null);

    try {
      const updatedTeam = await this.updateBackofficeTeamUseCase.execute({
        id: team.id,
        ...formValue,
      });

      await this.load(updatedTeam.id);
      this.closeEditDialog();
      this.actionToastStore.success(
        `Los cambios de ${updatedTeam.name} se han guardado.`,
        'Equipo actualizado',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No hemos podido actualizar el equipo.';

      this.editErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }

  async confirmStatusChange(): Promise<void> {
    const team = this.team();
    const targetStatus = this.pendingStatusTarget();

    if (!team || !targetStatus) {
      return;
    }

    this.isSubmittingEdit.set(true);

    try {
      const updatedTeam = await this.changeBackofficeTeamStatusUseCase.execute({
        teamId: team.id,
        targetStatus,
      });

      await this.load(updatedTeam.id);
      this.closeStatusDialog();
      this.actionToastStore.success(
        targetStatus === 'INACTIVE'
          ? `${updatedTeam.name} ha quedado inactivo.`
          : `${updatedTeam.name} ha quedado archivado.`,
        'Estado actualizado',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No hemos podido actualizar el estado del equipo.';

      this.editErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }
}
