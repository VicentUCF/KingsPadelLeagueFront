import { computed, inject, Injectable, signal } from '@angular/core';

import {
  DEFAULT_BACKOFFICE_TEAM_TAB,
  toBackofficeTeamDetailViewModel,
} from '../models/backoffice-teams.viewmodel';
import {
  type BackofficeTeamDetail,
  type BackofficeTeamTabId,
} from '../../domain/entities/backoffice-team.entity';
import { LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE } from '../providers/backoffice-teams.providers';

@Injectable()
export class BackofficeTeamDetailStore {
  private readonly loadBackofficeTeamDetailUseCase = inject(LOAD_BACKOFFICE_TEAM_DETAIL_USE_CASE);

  readonly team = signal<BackofficeTeamDetail | null>(null);
  readonly selectedTab = signal<BackofficeTeamTabId>(DEFAULT_BACKOFFICE_TEAM_TAB);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => {
    const team = this.team();

    return team ? toBackofficeTeamDetailViewModel(team) : null;
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
}
