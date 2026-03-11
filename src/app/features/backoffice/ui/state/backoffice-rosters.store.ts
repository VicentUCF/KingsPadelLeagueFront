import { computed, inject, Injectable, signal } from '@angular/core';

import { type BackofficeRosterSummary } from '../../domain/entities/backoffice-roster.entity';
import { toBackofficeRosterCardViewModel } from '../models/backoffice-rosters.viewmodel';
import { LOAD_BACKOFFICE_ROSTERS_USE_CASE } from '../providers/backoffice-rosters.providers';

@Injectable()
export class BackofficeRostersStore {
  private readonly loadBackofficeRostersUseCase = inject(LOAD_BACKOFFICE_ROSTERS_USE_CASE);

  readonly rosters = signal<readonly BackofficeRosterSummary[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly viewModel = computed(() => this.rosters().map(toBackofficeRosterCardViewModel));
  readonly seasonLabel = computed(() => this.rosters()[0]?.seasonLabel ?? null);
  readonly pendingRequestsCount = computed(() =>
    this.rosters().reduce((total, roster) => total + roster.pendingRequestsCount, 0),
  );
  readonly rostersInReviewCount = computed(
    () => this.rosters().filter((roster) => roster.status === 'REVIEW').length,
  );
  readonly summaryLabel = computed(() => {
    const seasonLabel = this.seasonLabel();

    if (!seasonLabel) {
      return null;
    }

    const pendingRequestsCount = this.pendingRequestsCount();
    const rostersInReviewCount = this.rostersInReviewCount();
    const requestsLabel =
      pendingRequestsCount === 1
        ? '1 solicitud pendiente'
        : `${pendingRequestsCount} solicitudes pendientes`;
    const reviewLabel =
      rostersInReviewCount === 1
        ? '1 plantilla en revisión'
        : `${rostersInReviewCount} plantillas en revisión`;

    return `${seasonLabel} · ${requestsLabel} · ${reviewLabel}`;
  });

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.rosters.set(await this.loadBackofficeRostersUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar las plantillas del backoffice.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
