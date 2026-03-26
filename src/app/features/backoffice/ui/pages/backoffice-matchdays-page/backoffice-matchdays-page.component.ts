import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { resolveBackofficeMatchdayCreationSeasonId } from '../../models/backoffice-season-resolution';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { BackofficeMatchdayFormDialogComponent } from '../../components/backoffice-matchday-form-dialog/backoffice-matchday-form-dialog.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-backoffice-matchdays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-matchdays-page' },
  imports: [
    LoadFeedbackComponent,
    LoadingStateComponent,
    RouterLink,
    StatusBadgeComponent,
    BackofficeMatchdayFormDialogComponent,
  ],
  templateUrl: './backoffice-matchdays-page.component.html',
  styleUrl: './backoffice-matchdays-page.component.scss',
})
export class BackofficeMatchdaysPageComponent implements OnInit {
  private readonly router = inject(Router);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly seasonsStore = inject(BackofficeSeasonsStore);
  protected readonly adminOperationsStore = inject(BackofficeAdminMatchdayOperationsStore);

  protected readonly isCreateDialogOpen = signal(false);
  protected readonly createDialogErrorMessage = signal<string | null>(null);
  protected readonly resolvedSeasonId = computed(() =>
    resolveBackofficeMatchdayCreationSeasonId(
      this.seasonsStore.seasons(),
      this.matchdaysStore.matchdays(),
    ),
  );
  protected readonly createMatchdayGuardrailMessage = computed(() => {
    if (this.sessionStore.currentRole() !== 'ADMIN') {
      return null;
    }

    if (this.seasonsStore.isLoading()) {
      return 'Estamos cargando la temporada activa para habilitar nuevas jornadas.';
    }

    if (this.resolvedSeasonId()) {
      return null;
    }

    return 'Necesitas una temporada activa o una jornada vinculada a temporada para crear nuevas jornadas.';
  });

  ngOnInit(): void {
    void this.matchdaysStore.load();
    if (this.sessionStore.currentRole() === 'ADMIN') {
      void this.seasonsStore.load();
    }
  }

  protected reloadMatchdays(): void {
    void this.matchdaysStore.load(true);
  }

  protected openCreateDialog(): void {
    if (this.createMatchdayGuardrailMessage()) {
      return;
    }

    this.createDialogErrorMessage.set(null);
    this.isCreateDialogOpen.set(true);
  }

  protected closeCreateDialog(): void {
    this.isCreateDialogOpen.set(false);
    this.createDialogErrorMessage.set(null);
  }

  protected async createMatchday(input: {
    readonly name: string;
    readonly scheduledAt: string;
  }): Promise<void> {
    const seasonId = this.resolvedSeasonId();
    if (!seasonId) {
      this.createDialogErrorMessage.set(
        'No hemos podido resolver una temporada activa para la nueva jornada.',
      );
      return;
    }

    this.createDialogErrorMessage.set(null);

    const matchdayId = await this.adminOperationsStore.createMatchday({
      ...input,
      seasonId,
    });
    if (!matchdayId) return;
    this.closeCreateDialog();
    await this.router.navigate(['/backoffice/jornadas', matchdayId]);
  }
}
