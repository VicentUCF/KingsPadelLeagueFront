import { computed, inject, Injectable, signal } from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';

import { type BackofficePlayerDetail } from '../../domain/entities/backoffice-player.entity';
import { type ChangeStatusBackofficePlayerCommand } from '../../application/commands/backoffice-player.commands';
import {
  type BackofficeConfirmDialogConfig,
  type BackofficePlayerFormValue,
  type BackofficeTeamOption,
} from '../models/backoffice-crud.model';
import { toBackofficePlayerDetailViewModel } from '../models/backoffice-players.viewmodel';
import {
  CHANGE_BACKOFFICE_PLAYER_STATUS_USE_CASE,
  LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE,
  LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE,
  UPDATE_BACKOFFICE_PLAYER_USE_CASE,
} from '../providers/backoffice-players.providers';

export interface BackofficePlayerStatusAction {
  readonly label: string;
  readonly targetStatus: ChangeStatusBackofficePlayerCommand['targetStatus'];
}

@Injectable()
export class BackofficePlayerDetailStore {
  private readonly loadBackofficePlayerDetailUseCase = inject(
    LOAD_BACKOFFICE_PLAYER_DETAIL_USE_CASE,
  );
  private readonly loadBackofficeTeamOptionsUseCase = inject(LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE);
  private readonly updateBackofficePlayerUseCase = inject(UPDATE_BACKOFFICE_PLAYER_USE_CASE);
  private readonly changeBackofficePlayerStatusUseCase = inject(
    CHANGE_BACKOFFICE_PLAYER_STATUS_USE_CASE,
  );
  private readonly actionToastStore = inject(ActionToastStore);

  readonly player = signal<BackofficePlayerDetail | null>(null);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly teamOptions = signal<readonly BackofficeTeamOption[]>([]);
  readonly isEditDialogOpen = signal(false);
  readonly isSubmittingEdit = signal(false);
  readonly editErrorMessage = signal<string | null>(null);
  readonly confirmDialog = signal<BackofficeConfirmDialogConfig | null>(null);
  readonly pendingStatusTarget = signal<ChangeStatusBackofficePlayerCommand['targetStatus'] | null>(
    null,
  );

  readonly viewModel = computed(() => {
    const player = this.player();

    return player ? toBackofficePlayerDetailViewModel(player) : null;
  });
  readonly editFormValue = computed<BackofficePlayerFormValue | null>(() => {
    const player = this.player();

    if (!player) {
      return null;
    }

    return {
      fullName: player.fullName,
      nickName: player.nickName,
      avatarPath: player.avatarPath,
      preferredSideLabel: player.preferredSideLabel,
      linkedUserEmail: player.linkedUserEmail,
      status: player.status,
      currentTeamId: player.currentTeamId,
    };
  });
  readonly statusActions = computed<readonly BackofficePlayerStatusAction[]>(() => {
    const player = this.player();

    if (!player || player.status !== 'ACTIVE') {
      return [];
    }

    return [{ label: 'Inactivar ficha', targetStatus: 'INACTIVE' }];
  });

  async load(playerId: string | null): Promise<void> {
    if (!playerId) {
      this.isNotFound.set(true);
      this.player.set(null);
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
      const [player, teams] = await Promise.all([
        this.loadBackofficePlayerDetailUseCase.execute(playerId),
        this.loadBackofficeTeamOptionsUseCase.execute(),
      ]);

      this.player.set(player);
      this.isNotFound.set(player === null);
      this.teamOptions.set(
        teams
          .filter((team) => team.status !== 'ARCHIVED')
          .map((team) => ({
            id: team.id,
            label: `${team.name} · ${team.shortName}`,
          })),
      );
    } catch {
      this.errorMessage.set('No hemos podido cargar el detalle del jugador.');
    } finally {
      this.isLoading.set(false);
    }
  }

  openEditDialog(): void {
    this.editErrorMessage.set(null);
    this.isEditDialogOpen.set(true);
  }

  closeEditDialog(): void {
    this.editErrorMessage.set(null);
    this.isEditDialogOpen.set(false);
  }

  openStatusDialog(action: BackofficePlayerStatusAction): void {
    const player = this.player();

    if (!player) {
      return;
    }

    this.pendingStatusTarget.set(action.targetStatus);
    this.confirmDialog.set({
      title: action.label,
      description: `Vas a inactivar la ficha de ${player.fullName}. Seguirá visible en histórico, pero dejará de operar como jugador activo.`,
      confirmLabel: action.label,
      confirmTone: 'danger',
    });
  }

  closeStatusDialog(): void {
    this.confirmDialog.set(null);
    this.pendingStatusTarget.set(null);
  }

  async updatePlayer(formValue: BackofficePlayerFormValue): Promise<void> {
    const player = this.player();

    if (!player) {
      return;
    }

    this.isSubmittingEdit.set(true);
    this.editErrorMessage.set(null);

    try {
      const updatedPlayer = await this.updateBackofficePlayerUseCase.execute({
        id: player.id,
        ...formValue,
      });

      await this.load(updatedPlayer.id);
      this.closeEditDialog();
      this.actionToastStore.success(
        `Los cambios de ${updatedPlayer.fullName} se han guardado.`,
        'Jugador actualizado',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No hemos podido actualizar la ficha.';

      this.editErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }

  async confirmStatusChange(): Promise<void> {
    const player = this.player();
    const targetStatus = this.pendingStatusTarget();

    if (!player || !targetStatus) {
      return;
    }

    this.isSubmittingEdit.set(true);

    try {
      const updatedPlayer = await this.changeBackofficePlayerStatusUseCase.execute({
        playerId: player.id,
        targetStatus,
      });

      await this.load(updatedPlayer.id);
      this.closeStatusDialog();
      this.actionToastStore.success(
        `${updatedPlayer.fullName} ha quedado inactivo.`,
        'Estado actualizado',
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No hemos podido actualizar el estado del jugador.';

      this.editErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingEdit.set(false);
    }
  }
}
