import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';

import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { TeamListCardComponent } from '../../components/team-list-card/team-list-card.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-backoffice-teams-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-teams-page' },
  imports: [LoadFeedbackComponent, LoadingStateComponent, TeamListCardComponent],
  templateUrl: './backoffice-teams-page.component.html',
  styleUrl: './backoffice-teams-page.component.scss',
})
export class BackofficeTeamsPageComponent implements OnInit {
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');
  protected readonly isLoading = computed(
    () => this.teamsStore.isLoading() || this.playersStore.isLoading(),
  );
  protected readonly hasContent = computed(
    () => this.teamsStore.hasContent() && this.playersStore.hasContent(),
  );
  protected readonly errorMessage = computed(
    () => this.teamsStore.errorMessage() ?? this.playersStore.errorMessage(),
  );

  protected readonly teamCards = computed(() =>
    this.teamsStore.buildCards(this.playersStore.players()),
  );

  ngOnInit(): void {
    void this.teamsStore.load();
    void this.playersStore.load();
  }

  protected reloadData(): void {
    void Promise.all([this.teamsStore.load(true), this.playersStore.load(true)]);
  }
}
