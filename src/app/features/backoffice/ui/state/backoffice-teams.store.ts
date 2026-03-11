import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeTeamSummary } from '../../domain/entities/backoffice-team.entity';
import { toBackofficeTeamCardViewModel } from '../models/backoffice-teams.viewmodel';
import { LOAD_BACKOFFICE_TEAMS_USE_CASE } from '../providers/backoffice-teams.providers';

@Injectable()
export class BackofficeTeamsStore {
  private readonly loadBackofficeTeamsUseCase = inject(LOAD_BACKOFFICE_TEAMS_USE_CASE);

  readonly teams = signal<readonly BackofficeTeamSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.teams().map(toBackofficeTeamCardViewModel));

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.teams.set(await this.loadBackofficeTeamsUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar los equipos del backoffice.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
