import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

import { ActionToastStore } from '@core/state/action-toast.store';

import { type BackofficeTeamSummary } from '../../domain/entities/backoffice-team.entity';
import { type BackofficeTeamFormValue } from '../models/backoffice-crud.model';
import { toBackofficeTeamCardViewModel } from '../models/backoffice-teams.viewmodel';
import {
  CREATE_BACKOFFICE_TEAM_USE_CASE,
  FIND_ACTIVE_BACKOFFICE_SEASON_USE_CASE,
  LOAD_BACKOFFICE_TEAMS_USE_CASE,
} from '../providers/backoffice-teams.providers';

@Injectable()
export class BackofficeTeamsStore {
  private readonly loadBackofficeTeamsUseCase = inject(LOAD_BACKOFFICE_TEAMS_USE_CASE);
  private readonly createBackofficeTeamUseCase = inject(CREATE_BACKOFFICE_TEAM_USE_CASE);
  private readonly findActiveBackofficeSeasonUseCase = inject(
    FIND_ACTIVE_BACKOFFICE_SEASON_USE_CASE,
  );
  private readonly router = inject(Router);
  private readonly actionToastStore = inject(ActionToastStore);

  readonly teams = signal<readonly BackofficeTeamSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly activeSeasonLabel = signal<string | null>(null);
  readonly isCreateDialogOpen = signal(false);
  readonly isSubmittingCreate = signal(false);
  readonly createErrorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.teams().map(toBackofficeTeamCardViewModel));
  readonly canCreate = computed(() => this.activeSeasonLabel() !== null);
  readonly createFormValue = computed<BackofficeTeamFormValue>(() => ({
    name: '',
    shortName: '',
    presidentName: '',
    primaryColor: '#1B1F3B',
    secondaryColor: '#D4AF37',
  }));

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [teams, activeSeason] = await Promise.all([
        this.loadBackofficeTeamsUseCase.execute(),
        this.findActiveBackofficeSeasonUseCase.execute(),
      ]);

      this.teams.set(teams);
      this.activeSeasonLabel.set(activeSeason?.name ?? null);
    } catch {
      this.errorMessage.set('No hemos podido cargar los equipos del backoffice.');
    } finally {
      this.isLoading.set(false);
    }
  }

  openCreateDialog(): void {
    if (!this.canCreate()) {
      return;
    }

    this.createErrorMessage.set(null);
    this.isCreateDialogOpen.set(true);
  }

  closeCreateDialog(): void {
    this.createErrorMessage.set(null);
    this.isCreateDialogOpen.set(false);
  }

  async createTeam(formValue: BackofficeTeamFormValue): Promise<void> {
    this.isSubmittingCreate.set(true);
    this.createErrorMessage.set(null);

    try {
      const createdTeam = await this.createBackofficeTeamUseCase.execute(formValue);

      await this.load();
      this.closeCreateDialog();
      this.actionToastStore.success(
        `El equipo ${createdTeam.name} ya está disponible en el backoffice.`,
        'Equipo creado',
      );
      await this.router.navigate(['/backoffice/equipos', createdTeam.id]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No hemos podido crear el equipo.';

      this.createErrorMessage.set(message);
      this.actionToastStore.error(message);
    } finally {
      this.isSubmittingCreate.set(false);
    }
  }
}
