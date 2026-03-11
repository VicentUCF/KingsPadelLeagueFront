import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeRosterDetail } from '../../domain/entities/backoffice-roster.entity';
import {
  DEFAULT_BACKOFFICE_ROSTER_TAB,
  toBackofficeRosterDetailViewModel,
} from '../models/backoffice-rosters.viewmodel';
import { type BackofficeRosterTabId } from '../../domain/entities/backoffice-roster.entity';
import { LOAD_BACKOFFICE_ROSTER_DETAIL_USE_CASE } from '../providers/backoffice-rosters.providers';

@Injectable()
export class BackofficeRosterDetailStore {
  private readonly loadBackofficeRosterDetailUseCase = inject(
    LOAD_BACKOFFICE_ROSTER_DETAIL_USE_CASE,
  );

  readonly roster = signal<BackofficeRosterDetail | null>(null);
  readonly selectedTab = signal<BackofficeRosterTabId>(DEFAULT_BACKOFFICE_ROSTER_TAB);
  readonly isLoading = signal(false);
  readonly isNotFound = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => {
    const roster = this.roster();

    return roster ? toBackofficeRosterDetailViewModel(roster) : null;
  });

  setSelectedTab(tabId: BackofficeRosterTabId): void {
    this.selectedTab.set(tabId);
  }

  async load(rosterId: string | null): Promise<void> {
    if (!rosterId) {
      this.isNotFound.set(true);
      this.roster.set(null);
      return;
    }

    this.isLoading.set(true);
    this.isNotFound.set(false);
    this.errorMessage.set(null);

    try {
      const roster = await this.loadBackofficeRosterDetailUseCase.execute(rosterId);

      this.roster.set(roster);
      this.isNotFound.set(roster === null);
      this.selectedTab.set(DEFAULT_BACKOFFICE_ROSTER_TAB);
    } catch {
      this.errorMessage.set('No hemos podido cargar el detalle de la plantilla.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
