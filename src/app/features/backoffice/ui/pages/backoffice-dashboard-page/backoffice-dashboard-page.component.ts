import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import type {
  BackofficePlayer,
  BackofficePlayerPosition,
} from '@features/backoffice/domain/entities/backoffice-player';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeStandingsStore } from '../../state/backoffice-standings.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';
import { DEFAULT_PALETTE, TEAM_PALETTE } from '../../models/backoffice-teams.viewmodel';

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
  protected readonly standingsStore = inject(BackofficeStandingsStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  // ── Admin computeds ──────────────────────────────────────────────────────
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

  // ── President computeds ──────────────────────────────────────────────────
  protected readonly presidentTeam = computed(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    return this.teamsStore.teams().find((t) => t.id === teamId) ?? null;
  });

  protected readonly presidentPlayerName = computed(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    const player = this.playersStore.players().find((p) => p.isPresident && p.teamId === teamId);
    if (!player) return null;
    return [player.firstName, player.lastName].filter(Boolean).join(' ');
  });

  protected readonly presidentTeamPlayers = computed(() => {
    const team = this.presidentTeam();
    if (!team) return [];
    return this.playersStore.players().filter((p) => p.teamId === team.id);
  });

  protected readonly presidentRoster = computed(() => {
    const players = this.presidentTeamPlayers();
    return [...players].sort((a, b) => {
      if (a.isPresident && !b.isPresident) return -1;
      if (!a.isPresident && b.isPresident) return 1;
      return b.wonGames + b.lostGames - (a.wonGames + a.lostGames);
    });
  });

  protected readonly presidentStanding = computed(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    return this.standingsStore.rows().find((r) => r.teamId === teamId) ?? null;
  });

  protected readonly presidentTeamPalette = computed(() => {
    const teamId = this.sessionStore.currentPresidentTeamId() ?? 'defaultl';
    return TEAM_PALETTE[teamId] ?? DEFAULT_PALETTE;
  });

  protected readonly nextMatchdayLinkForPresident = computed(() => {
    const next = this.matchdaysStore.nextMatchday();
    if (next) return `/backoffice/jornadas/${next.id}`;
    const current = this.matchdaysStore.currentMatchday();
    if (current) return `/backoffice/jornadas/${current.id}`;
    return '/backoffice/jornadas';
  });

  ngOnInit(): void {
    void this.teamsStore.load();
    void this.playersStore.load();
    void this.seasonsStore.load();
    void this.matchdaysStore.load();
    void this.standingsStore.load();
  }

  protected positionLabel(pos: BackofficePlayerPosition): string {
    switch (pos) {
      case 'left':
        return 'Revés';
      case 'right':
        return 'Drive';
      case 'both':
        return 'Ambas';
    }
  }

  protected winRateLabel(player: BackofficePlayer): string {
    const total = player.wonGames + player.lostGames;
    if (total === 0) return '—';
    return `${Math.round((player.wonGames / total) * 100)}%`;
  }
}
