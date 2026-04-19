import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Router } from '@angular/router';

import { ActionToastStore } from '@core/state/action-toast.store';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { BackofficeLineupPlannerComponent } from '../../components/backoffice-lineup-planner/backoffice-lineup-planner.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import {
  toBackofficeMatchCardViewModel,
  type BackofficeMatchCardViewModel,
} from '../../models/backoffice-lineups.viewmodel';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';
import {
  BackofficeLineupsStore,
  type BackofficeLineupDraftPairInput,
} from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';

@Component({
  selector: 'app-backoffice-lineups-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-lineups-page' },
  imports: [
    BackofficeLineupPlannerComponent,
    LoadFeedbackComponent,
    LoadingStateComponent,
    StatusBadgeComponent,
  ],
  templateUrl: './backoffice-lineups-page.component.html',
  styleUrl: './backoffice-lineups-page.component.scss',
})
export class BackofficeLineupsPageComponent implements OnInit {
  protected readonly lineupsStore = inject(BackofficeLineupsStore);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  private readonly toastStore = inject(ActionToastStore);
  private readonly router = inject(Router);

  protected readonly activeMatchdayId = signal<string | null>(null);
  protected readonly selectedMatchId = signal<string | null>(null);
  protected readonly plannerMatchId = signal<string | null>(null);
  protected readonly isRedirecting = signal(false);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly sessionErrorMessage = computed(() =>
    this.isAdmin() || this.sessionStore.currentPresidentTeamId()
      ? null
      : 'No hemos podido resolver el equipo del presidente desde la sesion actual.',
  );

  protected readonly activeMatchday = computed(
    () =>
      this.matchdaysStore.matchdays().find((matchday) => matchday.id === this.activeMatchdayId()) ??
      null,
  );

  protected readonly activeMatchdayRow = computed(() => {
    const matchday = this.activeMatchday();
    return matchday ? toBackofficeMatchdayRowViewModel(matchday) : null;
  });

  protected readonly selectedMatch = computed(
    () => this.lineupsStore.matches().find((match) => match.id === this.selectedMatchId()) ?? null,
  );

  protected readonly plannerMatch = computed(
    () => this.lineupsStore.matches().find((match) => match.id === this.plannerMatchId()) ?? null,
  );

  protected readonly presidentPlayers = computed(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!teamId) {
      return [];
    }

    return this.playersStore.players().filter((player) => player.teamId === teamId);
  });

  protected readonly plannerLineup = computed(() => {
    const match = this.plannerMatch();
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!match || !teamId) {
      return null;
    }

    return this.lineupsStore.lineupForMatch(match.id, teamId) ?? null;
  });

  protected readonly plannerPairs = computed(() => {
    const lineup = this.plannerLineup();

    return lineup ? this.lineupsStore.pairsForLineup(lineup.id) : [];
  });

  protected readonly selectedMatchCard = computed<BackofficeMatchCardViewModel | null>(() => {
    const match = this.selectedMatch();
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!match || !teamId) {
      return null;
    }

    const localTeam = this.teamsStore.teams().find((team) => team.id === match.localTeamId);
    const awayTeam = this.teamsStore.teams().find((team) => team.id === match.awayTeamId);

    if (!localTeam || !awayTeam) {
      return null;
    }

    const lineup = this.lineupsStore.lineupForMatch(match.id, teamId);
    const pairCount = lineup ? this.lineupsStore.pairsForLineup(lineup.id).length : 0;

    return toBackofficeMatchCardViewModel(match, localTeam, awayTeam, lineup, pairCount);
  });

  protected readonly plannerMatchTitle = computed(() => {
    const match = this.plannerMatch();

    if (!match) {
      return 'Partido';
    }

    const localTeamName =
      this.teamsStore.teams().find((team) => team.id === match.localTeamId)?.name ?? 'Local';
    const awayTeamName =
      this.teamsStore.teams().find((team) => team.id === match.awayTeamId)?.name ?? 'Visitante';

    return `${localTeamName} vs ${awayTeamName}`;
  });

  protected readonly plannerTeamName = computed(
    () =>
      this.teamsStore.teams().find((team) => team.id === this.sessionStore.currentPresidentTeamId())
        ?.name ?? 'Mi equipo',
  );

  protected readonly hasContent = computed(() => {
    if (this.isRedirecting()) {
      return true;
    }

    const baseReady =
      this.matchdaysStore.hasContent() &&
      this.teamsStore.hasContent() &&
      this.playersStore.hasContent();

    if (!baseReady) {
      return false;
    }

    return this.activeMatchday() ? this.lineupsStore.hasContent() : true;
  });

  protected readonly pageErrorMessage = computed(
    () =>
      this.sessionErrorMessage() ??
      this.lineupsStore.errorMessage() ??
      this.matchdaysStore.errorMessage() ??
      this.teamsStore.errorMessage() ??
      this.playersStore.errorMessage(),
  );

  ngOnInit(): void {
    if (this.isAdmin()) {
      this.isRedirecting.set(true);
      void this.router.navigate(['/backoffice/jornadas']);
      return;
    }

    void Promise.all([
      this.matchdaysStore.load(),
      this.teamsStore.load(),
      this.playersStore.load(),
    ]).then(() => this.loadDefaultMatchday());
  }

  protected onMatchChange(event: Event): void {
    const element = event.target;

    if (!(element instanceof HTMLSelectElement)) {
      return;
    }

    this.selectedMatchId.set(element.value || null);
  }

  protected openPlanner(): void {
    this.plannerMatchId.set(this.selectedMatchId());
  }

  protected closePlanner(): void {
    this.plannerMatchId.set(null);
  }

  protected reloadData(): void {
    if (this.isAdmin()) {
      return;
    }

    void Promise.all([
      this.matchdaysStore.load(true),
      this.teamsStore.load(true),
      this.playersStore.load(true),
    ]).then(() => this.loadDefaultMatchday(true));
  }

  protected async submitLineup(
    draftPairs: readonly BackofficeLineupDraftPairInput[],
  ): Promise<void> {
    const match = this.plannerMatch();
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!match || !teamId) {
      return;
    }

    try {
      await this.lineupsStore.submitDraft(match.id, teamId, draftPairs);
      this.closePlanner();
      this.toastStore.success('La alineacion se ha enviado correctamente.', 'Alineacion enviada');
    } catch (error) {
      if (error instanceof Error && error.message === 'lineup_not_initialized') {
        this.toastStore.error(
          'La alineacion aun no ha sido preparada por administracion.',
          'Alineacion no disponible',
        );
        return;
      }

      if (error instanceof Error && error.message === 'lineup_locked') {
        this.toastStore.error(
          'La alineacion ya fue enviada y no se puede modificar desde el front.',
          'Alineacion bloqueada',
        );
        return;
      }

      if (error instanceof Error && error.message === 'invalid_lineup_draft') {
        this.toastStore.error(
          'Debes completar exactamente 2 parejas validas antes de enviar la alineacion.',
          'Alineacion invalida',
        );
        return;
      }

      this.toastStore.error('No hemos podido enviar la alineacion.', 'No se ha podido enviar');
    }
  }

  private async loadDefaultMatchday(forceRefresh = false): Promise<void> {
    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!teamId) {
      return;
    }

    const matchday = this.matchdaysStore.currentMatchday() ?? this.matchdaysStore.nextMatchday();
    this.activeMatchdayId.set(matchday?.id ?? null);

    if (!matchday) {
      this.selectedMatchId.set(null);
      this.plannerMatchId.set(null);
      return;
    }

    await this.lineupsStore.loadForMatchdayAndTeam(matchday.id, teamId, forceRefresh);
    this.syncSelectedMatch();
  }

  private syncSelectedMatch(): void {
    const matches = this.lineupsStore.matches();

    if (matches.length === 0) {
      this.selectedMatchId.set(null);
      this.plannerMatchId.set(null);
      return;
    }

    if (!matches.some((match) => match.id === this.selectedMatchId())) {
      this.selectedMatchId.set(matches[0]!.id);
    }

    if (this.plannerMatchId() && !matches.some((match) => match.id === this.plannerMatchId())) {
      this.plannerMatchId.set(null);
    }
  }
}
