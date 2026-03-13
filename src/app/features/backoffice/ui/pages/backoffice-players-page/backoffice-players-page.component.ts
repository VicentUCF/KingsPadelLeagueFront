import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';

import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { PlayerDirectoryCardComponent } from '../../components/player-directory-card/player-directory-card.component';

@Component({
  selector: 'app-backoffice-players-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-players-page' },
  imports: [PlayerDirectoryCardComponent],
  templateUrl: './backoffice-players-page.component.html',
  styleUrl: './backoffice-players-page.component.scss',
})
export class BackofficePlayersPageComponent implements OnInit {
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly playerCards = computed(() =>
    this.playersStore.buildCards(this.teamsStore.teams()),
  );

  ngOnInit(): void {
    void this.playersStore.load();
    void this.teamsStore.load();
  }
}
