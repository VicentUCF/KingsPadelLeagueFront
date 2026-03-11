import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ActionToastStore } from '@core/state/action-toast.store';

import { type BackofficePlayerSummary } from '../../domain/entities/backoffice-player.entity';
import {
  type BackofficePlayerFormValue,
  type BackofficeTeamOption,
} from '../models/backoffice-crud.model';
import { toBackofficePlayerCardViewModel } from '../models/backoffice-players.viewmodel';
import {
  CREATE_BACKOFFICE_PLAYER_USE_CASE,
  LOAD_BACKOFFICE_PLAYERS_USE_CASE,
  LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE,
} from '../providers/backoffice-players.providers';

@Injectable()
export class BackofficePlayersStore {
  private readonly loadBackofficePlayersUseCase = inject(LOAD_BACKOFFICE_PLAYERS_USE_CASE);
  private readonly loadBackofficeTeamOptionsUseCase = inject(LOAD_BACKOFFICE_TEAM_OPTIONS_USE_CASE);
  private readonly createBackofficePlayerUseCase = inject(CREATE_BACKOFFICE_PLAYER_USE_CASE);
  private readonly router = inject(Router);
  private readonly actionToastStore = inject(ActionToastStore);

  readonly players = signal<readonly BackofficePlayerSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly teamOptions = signal<readonly BackofficeTeamOption[]>([]);
  readonly isCreateDialogOpen = signal(false);
  readonly isSubmittingCreate = signal(false);
  readonly createErrorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.players().map(toBackofficePlayerCardViewModel));
  readonly createFormValue = computed<BackofficePlayerFormValue>(() => ({
    fullName: '',
    nickName: '',
    avatarPath: null,
    preferredSideLabel: 'Revés',
    linkedUserEmail: null,
    status: 'ACTIVE',
    currentTeamId: null,
  }));

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [players, teams] = await Promise.all([
        this.loadBackofficePlayersUseCase.execute(),
        this.loadBackofficeTeamOptionsUseCase.execute(),
      ]);

      this.players.set(players);
      this.teamOptions.set(
        teams
          .filter((team) => team.status !== 'ARCHIVED')
          .map((team) => ({
            id: team.id,
            label: `${team.name} · ${team.shortName}`,
          })),
      );
    } catch {
      this.errorMessage.set('No hemos podido cargar el directorio de jugadores.');
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

  async createPlayer(formValue: BackofficePlayerFormValue): Promise<void> {
    this.isSubmittingCreate.set(true);
    this.createErrorMessage.set(null);

    try {
      const createdPlayer = await this.createBackofficePlayerUseCase.execute(formValue);

      await this.load();
      this.closeCreateDialog();
      this.actionToastStore.success(
        `La ficha de ${createdPlayer.fullName} ya está disponible.`,
        'Jugador creado',
      );
      await this.router.navigate(['/backoffice/jugadores', createdPlayer.id]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No hemos podido crear la ficha.';

      this.createErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingCreate.set(false);
    }
  }
}
