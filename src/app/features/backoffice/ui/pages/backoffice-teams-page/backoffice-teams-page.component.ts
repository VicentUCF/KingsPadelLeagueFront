import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';

import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { TeamListCardComponent } from '../../components/team-list-card/team-list-card.component';

@Component({
  selector: 'app-backoffice-teams-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-teams-page' },
  imports: [TeamListCardComponent],
  templateUrl: './backoffice-teams-page.component.html',
  styleUrl: './backoffice-teams-page.component.scss',
})
export class BackofficeTeamsPageComponent implements OnInit {
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly teamCards = computed(() =>
    this.teamsStore.buildCards(this.playersStore.players()),
  );

  ngOnInit(): void {
    void this.teamsStore.load();
    void this.playersStore.load();
  }
}
