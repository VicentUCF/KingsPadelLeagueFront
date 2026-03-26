import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { PlayerFormDialogComponent } from '../../components/player-form-dialog/player-form-dialog.component';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { PlayerDirectoryCardComponent } from '../../components/player-directory-card/player-directory-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import type { BackofficePlayerFormValue } from '../../models/backoffice-crud.model';

@Component({
  selector: 'app-backoffice-players-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-players-page' },
  imports: [
    LoadFeedbackComponent,
    LoadingStateComponent,
    PlayerDirectoryCardComponent,
    StatusBadgeComponent,
    PlayerFormDialogComponent,
  ],
  templateUrl: './backoffice-players-page.component.html',
  styleUrl: './backoffice-players-page.component.scss',
})
export class BackofficePlayersPageComponent implements OnInit {
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  private readonly toastStore = inject(ActionToastStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');
  protected readonly canViewLinkedEmails = computed(
    () => this.sessionStore.currentRole() !== 'PLAYER',
  );
  protected readonly editingCapabilityLabel = computed(() =>
    this.isAdmin()
      ? 'Edicion limitada disponible: alias, nombre, apellidos, posicion, Instagram e imagen.'
      : 'Directorio en modo consulta. La edicion de fichas esta reservada al backoffice admin.',
  );
  protected readonly isLoading = computed(
    () => this.playersStore.isLoading() || this.teamsStore.isLoading(),
  );
  protected readonly hasContent = computed(
    () => this.playersStore.hasContent() && this.teamsStore.hasContent(),
  );
  protected readonly errorMessage = computed(
    () => this.playersStore.errorMessage() ?? this.teamsStore.errorMessage(),
  );

  protected readonly playerCards = computed(() =>
    this.playersStore.buildCards(this.teamsStore.teams(), {
      showLinkedEmail: this.canViewLinkedEmails(),
    }),
  );

  protected readonly searchTerm = signal('');
  protected readonly viewMode = signal<'cards' | 'table'>('table');
  protected readonly isEditDialogOpen = signal(false);
  protected readonly editingPlayerId = signal<string | null>(null);
  protected readonly submissionError = signal<string | null>(null);

  protected readonly filteredPlayerCards = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return this.playerCards();
    return this.playerCards().filter(
      (p) =>
        p.title.toLowerCase().includes(term) ||
        p.nickLabel.toLowerCase().includes(term) ||
        p.derivedTeamLabel.toLowerCase().includes(term),
    );
  });

  protected setViewMode(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }

  protected readonly editingPlayer = computed(() => {
    const playerId = this.editingPlayerId();

    if (!playerId) {
      return null;
    }

    return this.playersStore.playerById(playerId);
  });

  protected readonly editDialogValue = computed<BackofficePlayerFormValue>(() => {
    const player = this.editingPlayer();
    const teamName = this.teamsStore.teams().find((team) => team.id === player?.teamId)?.name;

    return {
      firstName: player?.firstName ?? '',
      lastName: player?.lastName ?? '',
      alias: player?.alias ?? null,
      profileImage: player?.profileImage ?? null,
      preferredPosition: player?.preferredPosition ?? 'both',
      instagramUrl: player?.instagramUrl ?? null,
      email: player?.email ?? '',
      teamLabel: teamName ?? 'Sin equipo asignado',
    };
  });

  ngOnInit(): void {
    void this.playersStore.load();
    void this.teamsStore.load();
  }

  protected reloadData(): void {
    void Promise.all([this.playersStore.load(true), this.teamsStore.load(true)]);
  }

  protected openEditDialog(playerId: string): void {
    this.editingPlayerId.set(playerId);
    this.submissionError.set(null);
    this.isEditDialogOpen.set(true);
  }

  protected closeEditDialog(): void {
    this.isEditDialogOpen.set(false);
    this.editingPlayerId.set(null);
    this.submissionError.set(null);
  }

  protected async savePlayer(input: BackofficePlayerFormValue): Promise<void> {
    const player = this.editingPlayer();

    if (!player) {
      return;
    }

    try {
      await this.playersStore.update(player.id, {
        alias: input.alias ?? '',
        firstName: input.firstName,
        instagramUrl: input.instagramUrl ?? '',
        lastName: input.lastName,
        preferredPosition: input.preferredPosition,
        profileImage: input.profileImage ?? '',
      });
      this.closeEditDialog();
      this.toastStore.success(
        'La ficha del jugador se ha actualizado correctamente.',
        'Jugador actualizado',
      );
    } catch {
      this.submissionError.set('No hemos podido guardar los cambios de la ficha.');
    }
  }
}
