import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import type {
  BackofficePlayer,
  BackofficePlayerPosition,
} from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { resolveTeamBranding } from '@shared/utils/team-branding';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeStandingsStore } from '../../state/backoffice-standings.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';

@Component({
  selector: 'app-backoffice-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-dashboard-page' },
  imports: [
    EmptyStateComponent,
    LoadFeedbackComponent,
    LoadingStateComponent,
    RouterLink,
    StatusBadgeComponent,
  ],
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
  protected readonly isAdminDashboardLoading = computed(
    () =>
      this.teamsStore.isLoading() ||
      this.playersStore.isLoading() ||
      this.seasonsStore.isLoading() ||
      this.matchdaysStore.isLoading() ||
      this.standingsStore.isLoading(),
  );
  protected readonly hasAdminDashboardContent = computed(
    () =>
      this.teamsStore.hasContent() &&
      this.playersStore.hasContent() &&
      this.seasonsStore.hasContent() &&
      this.matchdaysStore.hasContent() &&
      this.standingsStore.hasContent(),
  );
  protected readonly adminDashboardErrorMessage = computed(
    () =>
      this.teamsStore.errorMessage() ??
      this.playersStore.errorMessage() ??
      this.seasonsStore.errorMessage() ??
      this.matchdaysStore.errorMessage() ??
      this.standingsStore.errorMessage(),
  );
  protected readonly isTeamDashboardLoading = computed(
    () =>
      this.teamsStore.isLoading() ||
      this.playersStore.isLoading() ||
      this.matchdaysStore.isLoading() ||
      this.standingsStore.isLoading(),
  );
  protected readonly hasTeamDashboardContent = computed(
    () =>
      this.teamsStore.hasContent() &&
      this.playersStore.hasContent() &&
      this.matchdaysStore.hasContent() &&
      this.standingsStore.hasContent(),
  );
  protected readonly teamDashboardErrorMessage = computed(
    () =>
      this.teamsStore.errorMessage() ??
      this.playersStore.errorMessage() ??
      this.matchdaysStore.errorMessage() ??
      this.standingsStore.errorMessage(),
  );

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

  protected readonly currentTeamBranding = computed(() =>
    resolveTeamBranding({
      teamName: this.presidentTeam()?.name ?? 'Mi equipo',
      fallbackLogoPath: this.presidentTeam()?.logo ?? null,
    }),
  );

  protected readonly managedPlayer = computed(() => {
    const currentEmail = normalizeEmail(this.sessionStore.currentUser()?.email);
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (currentEmail) {
      const currentPlayer = this.playersStore
        .players()
        .find((player) => normalizeEmail(player.email) === currentEmail);
      if (currentPlayer) {
        return currentPlayer;
      }
    }

    if (!teamId) {
      return null;
    }

    return (
      this.playersStore
        .players()
        .find((player) => player.isPresident && player.teamId === teamId) ?? null
    );
  });

  protected readonly presidentPlayerName = computed(() => {
    const player = this.managedPlayer();
    if (player) {
      return [player.firstName, player.lastName].filter(Boolean).join(' ');
    }

    return this.sessionStore.currentUser()?.displayName ?? null;
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
    return {
      primary: this.currentTeamBranding().palette.primary,
      secondary: this.currentTeamBranding().palette.surface,
    };
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

  protected reloadAdminDashboard(): void {
    void Promise.all([
      this.teamsStore.load(true),
      this.playersStore.load(true),
      this.seasonsStore.load(true),
      this.matchdaysStore.load(true),
      this.standingsStore.load(true),
    ]);
  }

  protected reloadTeamDashboard(): void {
    void Promise.all([
      this.teamsStore.load(true),
      this.playersStore.load(true),
      this.matchdaysStore.load(true),
      this.standingsStore.load(true),
    ]);
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

  protected teamLogoPath(team: BackofficeTeam | null): string | null {
    if (!team) {
      return null;
    }

    return resolveTeamBranding({
      teamName: team.name,
      fallbackLogoPath: team.logo,
    }).logoPath;
  }

  protected playerAvatarPath(player: BackofficePlayer): string | null {
    return resolvePlayerAvatarPath(player.profileImage);
  }
}

function normalizeEmail(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}
