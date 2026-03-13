import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';

@Component({
  selector: 'app-backoffice-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-dashboard-page' },
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './backoffice-dashboard-page.component.html',
  styleUrl: './backoffice-dashboard-page.component.scss',
})
export class BackofficeDashboardPageComponent implements OnInit {
  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly seasonsStore = inject(BackofficeSeasonsStore);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly teamCount = computed(() => this.teamsStore.teams().length);
  protected readonly playerCount = computed(() => this.playersStore.players().length);
  protected readonly seasonCount = computed(() => this.seasonsStore.seasons().length);
  protected readonly finishedMatchdayCount = computed(
    () => this.matchdaysStore.matchdays().filter((m) => m.status === 'finished').length,
  );

  protected readonly currentMatchdayRow = computed(() => {
    const m = this.matchdaysStore.currentMatchday();
    return m ? toBackofficeMatchdayRowViewModel(m) : null;
  });

  protected readonly nextMatchdayRow = computed(() => {
    const m = this.matchdaysStore.nextMatchday();
    return m ? toBackofficeMatchdayRowViewModel(m) : null;
  });

  // President view: show their own team and its players
  protected readonly presidentTeam = computed(() => {
    const player = this.playersStore.players().find((p) => p.isPresident);
    if (!player?.teamId) return null;
    return this.teamsStore.teams().find((t) => t.id === player.teamId) ?? null;
  });

  protected readonly presidentPlayerName = computed(() => {
    const player = this.playersStore.players().find((p) => p.isPresident);
    if (!player) return null;
    return [player.firstName, player.lastName].filter(Boolean).join(' ');
  });

  protected readonly presidentTeamPlayers = computed(() => {
    const team = this.presidentTeam();
    if (!team) return [];
    return this.playersStore.players().filter((p) => p.teamId === team.id);
  });

  ngOnInit(): void {
    void this.teamsStore.load();
    void this.playersStore.load();
    void this.seasonsStore.load();
    void this.matchdaysStore.load();
  }
}
