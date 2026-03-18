import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';

import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { PlayerDirectoryCardComponent } from '../../components/player-directory-card/player-directory-card.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-backoffice-players-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-players-page' },
  imports: [
    LoadFeedbackComponent,
    LoadingStateComponent,
    PlayerDirectoryCardComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './backoffice-players-page.component.html',
  styleUrl: './backoffice-players-page.component.scss',
})
export class BackofficePlayersPageComponent implements OnInit {
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');
  protected readonly canViewLinkedEmails = computed(
    () => this.sessionStore.currentRole() !== 'PLAYER',
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
  protected readonly viewMode = signal<'cards' | 'table'>('cards');

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

  ngOnInit(): void {
    void this.playersStore.load();
    void this.teamsStore.load();
  }

  protected reloadData(): void {
    void Promise.all([this.playersStore.load(true), this.teamsStore.load(true)]);
  }
}
