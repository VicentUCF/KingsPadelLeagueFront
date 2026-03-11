import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeDashboardSnapshot } from '../../domain/entities/backoffice-dashboard-snapshot.entity';
import {
  toBackofficeDashboardViewModel,
  type BackofficeDashboardViewModel,
} from '../models/backoffice-dashboard.viewmodel';
import { LOAD_BACKOFFICE_DASHBOARD_SNAPSHOT_USE_CASE } from '../providers/backoffice.providers';
import { BackofficeSessionStore } from './backoffice-session.store';

@Injectable()
export class BackofficeDashboardStore {
  private readonly loadBackofficeDashboardSnapshotUseCase = inject(
    LOAD_BACKOFFICE_DASHBOARD_SNAPSHOT_USE_CASE,
  );
  private readonly sessionStore = inject(BackofficeSessionStore);

  readonly snapshot = signal<BackofficeDashboardSnapshot | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed<BackofficeDashboardViewModel | null>(() => {
    const snapshot = this.snapshot();

    return snapshot
      ? toBackofficeDashboardViewModel(snapshot, this.sessionStore.currentRole())
      : null;
  });

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.snapshot.set(await this.loadBackofficeDashboardSnapshotUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar el panel operativo del backoffice.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
