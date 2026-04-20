import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';
import type { BackofficeMatchEncounter } from '@features/backoffice/domain/rules/backoffice-match-encounter.rule';
import type { BackofficeLineupPair } from '@features/backoffice/domain/entities/backoffice-lineup';
import { ActionToastStore } from '@core/state/action-toast.store';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { BackofficeLineupPlannerComponent } from '../../components/backoffice-lineup-planner/backoffice-lineup-planner.component';
import { BackofficeMatchFormDialogComponent } from '../../components/backoffice-match-form-dialog/backoffice-match-form-dialog.component';
import { BackofficePairMatchResultDialogComponent } from '../../components/backoffice-pair-match-result-dialog/backoffice-pair-match-result-dialog.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import {
  createBackofficeMatchdayOperationViewModel,
  createBackofficeMatchOperationViewModel,
  type BackofficeMatchOperationViewModel,
} from '../../models/backoffice-lineup-operation.viewmodel';
import {
  toBackofficeMatchCardViewModel,
  type BackofficeMatchCardViewModel,
} from '../../models/backoffice-lineups.viewmodel';
import { createDefaultBackofficeMatchScheduledAt } from '../../models/backoffice-match-form-schedule';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import {
  type BackofficeLineupDraftPairInput,
  BackofficeLineupsStore,
} from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';

interface MatchPairSlotViewModel {
  readonly order: 1 | 2;
  readonly label: string;
  readonly pointsLabel: string;
  readonly localPair: BackofficeLineupPair | null;
  readonly awayPair: BackofficeLineupPair | null;
  readonly pairMatch: BackofficePairMatch | null;
}

interface ActionGuardrailViewModel {
  readonly disabled: boolean;
  readonly reason: string | null;
}

interface MatchdayOverviewViewModel {
  readonly totalMatches: number;
  readonly finishedMatches: number;
  readonly pendingMatches: number;
  readonly expectedPairMatches: number;
  readonly generatedPairMatches: number;
  readonly pendingPairMatches: number;
  readonly completedResults: number;
  readonly pendingResults: number;
}

type ConfirmActionKind =
  | 'prepare-base-lineups'
  | 'start-matchday'
  | 'finish-matchday'
  | 'create-pair-matches'
  | 'start-match'
  | 'finish-match';

const MATCH_PAIR_SLOT_CONFIG = [
  { order: 1 as const, label: 'Partido 1', pointsLabel: '3 puntos' },
  { order: 2 as const, label: 'Partido 2', pointsLabel: '2 puntos' },
] as const;

@Component({
  selector: 'app-backoffice-matchday-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-matchday-detail-page' },
  imports: [
    BackofficeLineupPlannerComponent,
    BackofficeMatchFormDialogComponent,
    BackofficePairMatchResultDialogComponent,
    ConfirmActionDialogComponent,
    LoadFeedbackComponent,
    LoadingStateComponent,
    RouterLink,
    StatusBadgeComponent,
  ],
  templateUrl: './backoffice-matchday-detail-page.component.html',
  styleUrl: './backoffice-matchday-detail-page.component.scss',
})
export class BackofficeMatchdayDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly document = inject(DOCUMENT);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly lineupsStore = inject(BackofficeLineupsStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly adminOperationsStore = inject(BackofficeAdminMatchdayOperationsStore);
  private readonly toastStore = inject(ActionToastStore);

  protected readonly matchdayId = signal('');
  protected readonly selectedMatchId = signal<string | null>(null);
  protected readonly selectedPlannerTeamId = signal<string | null>(null);
  protected readonly confirmAction = signal<{
    readonly kind: ConfirmActionKind;
    readonly matchId?: string;
    readonly title: string;
    readonly description: string;
    readonly confirmLabel: string;
  } | null>(null);
  protected readonly isCreateMatchDialogOpen = signal(false);
  protected readonly editingPairMatchId = signal<string | null>(null);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');
  protected readonly sessionErrorMessage = computed(() =>
    this.isAdmin() || this.sessionStore.currentPresidentTeamId()
      ? null
      : 'No hemos podido resolver el equipo del presidente desde la sesion actual.',
  );

  protected readonly hasContent = computed(
    () =>
      this.matchdaysStore.hasContent() &&
      this.teamsStore.hasContent() &&
      (this.isAdmin()
        ? this.lineupsStore.hasContent()
        : this.sessionErrorMessage() !== null || this.lineupsStore.hasContent()),
  );

  protected readonly pageErrorMessage = computed(
    () =>
      this.sessionErrorMessage() ??
      this.matchdaysStore.errorMessage() ??
      this.teamsStore.errorMessage() ??
      this.lineupsStore.errorMessage() ??
      this.playersStore.errorMessage() ??
      this.adminOperationsStore.pairMatchesErrorMessage(),
  );

  protected readonly matchday = computed(
    () =>
      this.matchdaysStore.matchdays().find((matchday) => matchday.id === this.matchdayId()) ?? null,
  );

  protected readonly matchdayRow = computed(() => {
    const matchday = this.matchday();
    return matchday ? toBackofficeMatchdayRowViewModel(matchday) : null;
  });

  protected readonly isMatchdayFinished = computed(() => this.matchday()?.status === 'finished');

  protected readonly presidentTeam = computed<BackofficeTeam | null>(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    return this.teamsStore.teams().find((team) => team.id === teamId) ?? null;
  });

  protected readonly matchdayMatches = computed(() =>
    this.lineupsStore.matches().filter((match) => match.matchdayId === this.matchdayId()),
  );

  protected readonly existingMatchEncounters = computed<readonly BackofficeMatchEncounter[]>(() =>
    this.matchdayMatches().map((match) => ({
      localTeamId: match.localTeamId,
      awayTeamId: match.awayTeamId,
    })),
  );

  protected readonly createMatchInitialValue = computed(() => ({
    localTeamId: '',
    awayTeamId: '',
    scheduledAt: this.matchday()
      ? createDefaultBackofficeMatchScheduledAt(this.matchday()!.scheduledAt)
      : '',
  }));

  protected readonly matchCards = computed<readonly BackofficeMatchCardViewModel[]>(() => {
    const matches = this.matchdayMatches();
    const teams = this.teamsStore.teams();
    const presidentTeamId = this.sessionStore.currentPresidentTeamId();

    return matches
      .map((match) => {
        const localTeam = teams.find((team) => team.id === match.localTeamId);
        const awayTeam = teams.find((team) => team.id === match.awayTeamId);

        if (!localTeam || !awayTeam) {
          return null;
        }

        const lineup = this.isAdmin()
          ? this.lineupsStore.lineups().find((candidate) => candidate.matchId === match.id)
          : this.lineupsStore.lineupForMatch(match.id, presidentTeamId ?? '');
        const pairCount = lineup ? this.lineupsStore.pairsForLineup(lineup.id).length : 0;

        return toBackofficeMatchCardViewModel(match, localTeam, awayTeam, lineup, pairCount);
      })
      .filter((card): card is BackofficeMatchCardViewModel => card !== null);
  });

  protected readonly matchOperationSummaries = computed<
    readonly BackofficeMatchOperationViewModel[]
  >(() =>
    this.matchdayMatches().map((match) => {
      const localPairs = this.pairsForMatchTeam(match.id, match.localTeamId);
      const awayPairs = this.pairsForMatchTeam(match.id, match.awayTeamId);

      return createBackofficeMatchOperationViewModel({
        match,
        localLineup: this.lineupsStore.lineupForMatch(match.id, match.localTeamId) ?? null,
        awayLineup: this.lineupsStore.lineupForMatch(match.id, match.awayTeamId) ?? null,
        localPairs,
        awayPairs,
        localTeamPlayers: this.playersStore
          .players()
          .filter((player) => player.teamId === match.localTeamId),
        awayTeamPlayers: this.playersStore
          .players()
          .filter((player) => player.teamId === match.awayTeamId),
        pairMatches: this.pairMatchesForPairs(localPairs, awayPairs),
      });
    }),
  );

  protected readonly matchdayOperation = computed(() =>
    createBackofficeMatchdayOperationViewModel(this.matchOperationSummaries()),
  );

  protected readonly matchdayOverview = computed<MatchdayOverviewViewModel>(() => ({
    totalMatches: this.matchdayOperation().totalMatches,
    finishedMatches: this.matchdayOperation().finishedMatches,
    pendingMatches: this.matchdayOperation().pendingMatches,
    expectedPairMatches: this.matchdayOperation().expectedPairMatches,
    generatedPairMatches: this.matchdayOperation().generatedPairMatches,
    pendingPairMatches: this.matchdayOperation().pendingPairMatches,
    completedResults: this.matchdayOperation().completedPairMatches,
    pendingResults: this.matchdayOperation().pendingResults,
  }));

  protected readonly prepareBaseLineupsGuardrail = computed(() => {
    const matchday = this.matchday();

    if (!matchday || matchday.status === 'finished') {
      return this.createGuardrail(
        true,
        'La jornada finalizada no permite preparar nuevas alineaciones base.',
      );
    }

    if (this.matchdayOperation().totalMatches === 0) {
      return this.createGuardrail(
        true,
        'Necesitas al menos 1 partido para preparar alineaciones base.',
      );
    }

    const hasMissingBaseLineups = this.matchOperationSummaries().some(
      (summary) =>
        !summary.localLineupSummary.lineupExists || !summary.awayLineupSummary.lineupExists,
    );

    if (!hasMissingBaseLineups) {
      return this.createGuardrail(true, 'Todos los partidos ya tienen sus contenedores base.');
    }

    return this.createGuardrail(false);
  });

  protected readonly startMatchdayGuardrail = computed(() => {
    const matchday = this.matchday();

    if (!matchday || matchday.status !== 'scheduled') {
      return this.createGuardrail(
        true,
        'La jornada solo se puede iniciar desde estado programado.',
      );
    }

    if (!this.matchdayOperation().matchdayReadyToStart) {
      return this.createGuardrail(true, this.matchdayOperation().startReasons[0] ?? null);
    }

    return this.createGuardrail(false);
  });

  protected readonly finishMatchdayGuardrail = computed(() => {
    const matchday = this.matchday();

    if (!matchday || matchday.status !== 'in_progress') {
      return this.createGuardrail(true, 'La jornada debe estar en curso para poder finalizarla.');
    }

    if (!this.matchdayOperation().matchdayReadyToFinish) {
      return this.createGuardrail(true, this.matchdayOperation().finishReasons[0] ?? null);
    }

    return this.createGuardrail(false);
  });

  protected readonly createPairMatchupsGuardrail = computed(() => {
    const matchday = this.matchday();

    if (!matchday || matchday.status === 'finished') {
      return this.createGuardrail(
        true,
        'La jornada ya esta finalizada y no admite nuevos enfrentamientos.',
      );
    }

    if (!this.matchdayOperation().matchdayReadyForPairGeneration) {
      return this.createGuardrail(true, this.matchdayOperation().pairGenerationReasons[0] ?? null);
    }

    return this.createGuardrail(false);
  });

  protected readonly createMatchGuardrail = computed(() => {
    const matchday = this.matchday();

    if (!matchday || matchday.status === 'finished') {
      return this.createGuardrail(true, 'La jornada finalizada no permite crear mas partidos.');
    }

    return this.createGuardrail(false);
  });

  protected readonly disabledAdminActionMessages = computed(() =>
    [
      this.prepareBaseLineupsGuardrail().reason,
      this.startMatchdayGuardrail().reason,
      this.finishMatchdayGuardrail().reason,
      this.createPairMatchupsGuardrail().reason,
      this.createMatchGuardrail().reason,
    ].filter(
      (message, index, messages): message is string =>
        !!message && messages.indexOf(message) === index,
    ),
  );

  protected readonly primaryAction = computed(() => {
    const matchday = this.matchday();

    if (!this.isAdmin() || !matchday) {
      return { kind: 'none' as const, label: '', description: '' };
    }

    if (matchday.status === 'scheduled') {
      if (this.matchdayOperation().totalMatches === 0) {
        return {
          kind: 'create-match' as const,
          label: 'Crear primer partido',
          description: 'Crea el primer partido para desbloquear la operativa de la jornada.',
        };
      }

      if (!this.prepareBaseLineupsGuardrail().disabled) {
        return {
          kind: 'prepare-base-lineups' as const,
          label: 'Preparar alineaciones base',
          description:
            'Faltan contenedores base de alineacion y la jornada no puede avanzar hasta completarlos.',
        };
      }

      if (!this.createPairMatchupsGuardrail().disabled) {
        return {
          kind: 'create-pair-matchups' as const,
          label: 'Generar enfrentamientos de parejas',
          description:
            'Las dos alineaciones de cada partido ya estan enviadas y listas para generar los cruces.',
        };
      }

      if (!this.startMatchdayGuardrail().disabled) {
        return {
          kind: 'start-matchday' as const,
          label: 'Iniciar jornada',
          description: 'Los cruces ya estan preparados y la jornada puede pasar a estado en curso.',
        };
      }

      return {
        kind: 'review-lineups' as const,
        label: 'Revisar alineaciones',
        description:
          'Aun faltan alineaciones enviadas o contenedores base antes de arrancar la jornada.',
      };
    }

    if (matchday.status === 'in_progress' && this.matchdayOperation().pendingResults > 0) {
      return {
        kind: 'review-results' as const,
        label: 'Registrar resultados pendientes',
        description:
          'Quedan resultados de enfrentamientos por registrar antes de cerrar los partidos.',
      };
    }

    if (matchday.status === 'in_progress' && !this.finishMatchdayGuardrail().disabled) {
      return {
        kind: 'finish-matchday' as const,
        label: 'Finalizar jornada',
        description:
          'Todos los partidos estan cerrados y la jornada ya puede darse por finalizada.',
      };
    }

    return {
      kind: 'review-results' as const,
      label: 'Revisar jornada',
      description:
        'Comprueba el estado de los partidos y registra los resultados pendientes desde el acta.',
    };
  });

  protected readonly plannerMatch = computed(
    () => this.matchdayMatches().find((match) => match.id === this.selectedMatchId()) ?? null,
  );

  protected readonly currentPlannerTeamId = computed(() =>
    this.isAdmin() ? this.selectedPlannerTeamId() : this.sessionStore.currentPresidentTeamId(),
  );

  protected readonly plannerLineup = computed(() => {
    const match = this.plannerMatch();
    const teamId = this.currentPlannerTeamId();

    if (!match || !teamId) {
      return null;
    }

    return this.lineupsStore.lineupForMatch(match.id, teamId) ?? null;
  });

  protected readonly plannerPairs = computed(() => {
    const lineup = this.plannerLineup();
    return lineup ? this.lineupsStore.pairsForLineup(lineup.id) : [];
  });

  protected readonly plannerPlayers = computed(() => {
    const teamId = this.currentPlannerTeamId();
    return teamId ? this.playersStore.players().filter((player) => player.teamId === teamId) : [];
  });

  protected readonly plannerTeamName = computed(
    () =>
      this.teamsStore.teams().find((team) => team.id === this.currentPlannerTeamId())?.name ??
      'Mi equipo',
  );

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

  protected readonly currentEditingPairMatch = computed<BackofficePairMatch | null>(
    () =>
      this.adminOperationsStore
        .pairMatches()
        .find((pairMatch) => pairMatch.id === this.editingPairMatchId()) ?? null,
  );

  ngOnInit(): void {
    const matchdayId = this.route.snapshot.paramMap.get('matchdayId') ?? '';
    this.matchdayId.set(matchdayId);

    void this.matchdaysStore.load();
    void this.teamsStore.load();
    void this.playersStore.load();
    void this.loadMatchdayContext();
  }

  protected reloadPage(): void {
    void Promise.all([
      this.matchdaysStore.load(true),
      this.teamsStore.load(true),
      this.playersStore.load(true),
    ]).then(() => this.loadMatchdayContext(true));
  }

  protected runPrimaryAction(): void {
    const action = this.primaryAction();

    switch (action.kind) {
      case 'prepare-base-lineups':
        if (!this.prepareBaseLineupsGuardrail().disabled) {
          this.openConfirmAction(
            'prepare-base-lineups',
            'Preparar alineaciones base',
            'Se crearan solo los contenedores base de alineacion que falten en la jornada.',
            'Preparar alineaciones',
          );
        }
        break;
      case 'create-pair-matchups':
        if (!this.createPairMatchupsGuardrail().disabled) {
          this.openConfirmAction(
            'create-pair-matches',
            'Generar enfrentamientos de parejas',
            'Se crearan los cruces de parejas de todos los partidos listos de la jornada.',
            'Generar enfrentamientos',
          );
        }
        break;
      case 'start-matchday':
        if (!this.startMatchdayGuardrail().disabled) {
          this.openConfirmAction(
            'start-matchday',
            'Iniciar jornada',
            'La jornada pasara a estar en curso.',
            'Iniciar jornada',
          );
        }
        break;
      case 'finish-matchday':
        if (!this.finishMatchdayGuardrail().disabled) {
          this.openConfirmAction(
            'finish-matchday',
            'Finalizar jornada',
            'La jornada pasara a estado finalizado.',
            'Finalizar jornada',
          );
        }
        break;
      case 'review-lineups':
      case 'review-results':
        this.scrollToMatches();
        break;
      case 'create-match':
        if (!this.createMatchGuardrail().disabled) {
          this.openCreateMatchDialog();
        }
        break;
      case 'none':
        break;
    }
  }

  protected openConfirmAction(
    kind: ConfirmActionKind,
    title: string,
    description: string,
    confirmLabel: string,
    matchId?: string,
  ): void {
    this.confirmAction.set(
      matchId
        ? { kind, title, description, confirmLabel, matchId }
        : { kind, title, description, confirmLabel },
    );
  }

  protected closeConfirmAction(): void {
    this.confirmAction.set(null);
  }

  protected async executeConfirmAction(): Promise<void> {
    const action = this.confirmAction();

    if (!action) {
      return;
    }

    switch (action.kind) {
      case 'prepare-base-lineups':
        await this.adminOperationsStore.prepareBaseLineups(this.matchdayId());
        break;
      case 'start-matchday':
        await this.adminOperationsStore.startMatchday(this.matchdayId());
        break;
      case 'finish-matchday':
        await this.adminOperationsStore.finishMatchday(this.matchdayId());
        break;
      case 'create-pair-matches':
        await this.adminOperationsStore.createPairMatches(this.matchdayId());
        break;
      case 'start-match':
        if (action.matchId) {
          await this.adminOperationsStore.startMatch(this.matchdayId(), action.matchId);
        }
        break;
      case 'finish-match':
        if (action.matchId) {
          await this.adminOperationsStore.finishMatch(this.matchdayId(), action.matchId);
        }
        break;
    }

    this.closeConfirmAction();
  }

  protected openCreateMatchDialog(): void {
    if (this.createMatchGuardrail().disabled) {
      return;
    }

    this.isCreateMatchDialogOpen.set(true);
  }

  protected closeCreateMatchDialog(): void {
    this.isCreateMatchDialogOpen.set(false);
  }

  protected async createMatch(input: {
    readonly localTeamId: string;
    readonly awayTeamId: string;
    readonly scheduledAt: string;
  }): Promise<void> {
    const created = await this.adminOperationsStore.createMatch({
      matchdayId: this.matchdayId(),
      localTeamId: input.localTeamId,
      awayTeamId: input.awayTeamId,
      scheduledAt: input.scheduledAt,
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
    });

    if (created) {
      this.closeCreateMatchDialog();
    }
  }

  protected openPlanner(matchId: string, teamId: string): void {
    this.selectedMatchId.set(matchId);
    this.selectedPlannerTeamId.set(teamId);
  }

  protected closePlanner(): void {
    this.selectedMatchId.set(null);
    this.selectedPlannerTeamId.set(null);
  }

  protected async submitLineup(
    draftPairs: readonly BackofficeLineupDraftPairInput[],
  ): Promise<void> {
    const match = this.plannerMatch();
    const teamId = this.currentPlannerTeamId();

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

  protected lineupStatusForMatchTeam(
    matchId: string,
    teamId: string,
  ): BackofficeMatchCardViewModel['lineupStatus'] {
    return this.lineupsStore.lineupForMatch(matchId, teamId)?.status ?? 'no_lineup';
  }

  protected lineupStatusTone(
    status: BackofficeMatchCardViewModel['lineupStatus'],
  ): BackofficeMatchCardViewModel['lineupStatusTone'] {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'submited':
        return 'success';
      case 'no_lineup':
        return 'neutral';
    }
  }

  protected lineupPairCountForMatchTeam(matchId: string, teamId: string): number {
    const lineup = this.lineupsStore.lineupForMatch(matchId, teamId);
    return lineup ? this.lineupsStore.pairsForLineup(lineup.id).length : 0;
  }

  protected openPairMatchResultDialog(pairMatchId: string): void {
    const pairMatch = this.adminOperationsStore
      .pairMatches()
      .find((candidate) => candidate.id === pairMatchId);

    if (!pairMatch || pairMatch.setsResult.length > 0) {
      return;
    }

    this.editingPairMatchId.set(pairMatchId);
  }

  protected closePairMatchResultDialog(): void {
    this.editingPairMatchId.set(null);
  }

  protected async savePairMatchResult(input: {
    readonly setsResult: readonly { readonly local: number; readonly away: number }[];
  }): Promise<void> {
    const pairMatch = this.currentEditingPairMatch();

    if (!pairMatch || pairMatch.setsResult.length > 0) {
      return;
    }

    await this.adminOperationsStore.finishPairMatch(this.matchdayId(), pairMatch.id, input);
    this.closePairMatchResultDialog();
  }

  protected pairMatchForPairIds(
    localPairId: string | null | undefined,
    awayPairId: string | null | undefined,
  ): BackofficePairMatch | null {
    if (!localPairId || !awayPairId) {
      return null;
    }

    return (
      this.adminOperationsStore
        .pairMatches()
        .find(
          (pairMatch) =>
            pairMatch.localLineUpPairId === localPairId &&
            pairMatch.awayLineUpPairId === awayPairId,
        ) ?? null
    );
  }

  protected pairMatchResultLabel(pairMatch: BackofficePairMatch | null): string {
    if (!pairMatch || pairMatch.setsResult.length === 0) {
      return 'Sin resultado';
    }

    return pairMatch.setsResult.map((set) => `${set.local}-${set.away}`).join(' · ');
  }

  protected startMatchGuardrail(matchId: string): ActionGuardrailViewModel {
    const match = this.matchdayMatches().find((candidate) => candidate.id === matchId);

    if (!match) {
      return this.createGuardrail(true, 'No hemos encontrado el partido seleccionado.');
    }

    if (match.status !== 'scheduled') {
      return this.createGuardrail(true, 'Solo puedes iniciar partidos programados.');
    }

    const summary = this.matchOperationFor(matchId);

    if (!summary?.matchReadyToStart) {
      return this.createGuardrail(true, summary?.startReasons[0] ?? null);
    }

    return this.createGuardrail(false);
  }

  protected finishMatchGuardrail(matchId: string): ActionGuardrailViewModel {
    const summary = this.matchOperationFor(matchId);

    if (!summary) {
      return this.createGuardrail(true, 'No hemos encontrado el partido seleccionado.');
    }

    if (!summary.matchReadyToFinish) {
      return this.createGuardrail(true, summary.finishReasons[0] ?? null);
    }

    return this.createGuardrail(false);
  }

  protected matchGuardrailMessage(matchId: string): string | null {
    const messages = [
      this.startMatchGuardrail(matchId).reason,
      this.finishMatchGuardrail(matchId).reason,
    ].filter(
      (message, index, all): message is string => !!message && all.indexOf(message) === index,
    );

    return messages.length > 0 ? messages.join(' · ') : null;
  }

  protected matchStatusLabel(
    status:
      | BackofficeMatchCardViewModel['lineupStatus']
      | BackofficePairMatch['status']
      | 'scheduled'
      | 'in_progress'
      | 'finished',
  ): string {
    switch (status) {
      case 'scheduled':
        return 'Programado';
      case 'in_progress':
        return 'En juego';
      case 'finished':
        return 'Finalizado';
      case 'pending':
        return 'Pendiente';
      case 'submited':
        return 'Enviada';
      case 'no_lineup':
        return 'Sin alineacion';
    }
  }

  protected matchStatusTone(
    status: 'scheduled' | 'in_progress' | 'finished',
  ): 'neutral' | 'warning' | 'success' {
    switch (status) {
      case 'scheduled':
        return 'neutral';
      case 'in_progress':
        return 'warning';
      case 'finished':
        return 'success';
    }
  }

  protected playerById(playerId: string | null): BackofficePlayer | null {
    if (!playerId) {
      return null;
    }

    return this.playersStore.players().find((player) => player.id === playerId) ?? null;
  }

  protected pairsForMatchTeam(matchId: string, teamId: string): readonly BackofficeLineupPair[] {
    const lineup = this.lineupsStore.lineupForMatch(matchId, teamId);
    return lineup ? this.lineupsStore.pairsForLineup(lineup.id) : [];
  }

  protected pairMatchupsForMatch(
    matchId: string,
    localTeamId: string,
    awayTeamId: string,
  ): readonly MatchPairSlotViewModel[] {
    const localPairs = this.pairsForMatchTeam(matchId, localTeamId);
    const awayPairs = this.pairsForMatchTeam(matchId, awayTeamId);

    return MATCH_PAIR_SLOT_CONFIG.map((slotConfig, index) => ({
      order: slotConfig.order,
      label: slotConfig.label,
      pointsLabel: slotConfig.pointsLabel,
      localPair: localPairs[index] ?? null,
      awayPair: awayPairs[index] ?? null,
      pairMatch: this.pairMatchForPairIds(localPairs[index]?.id, awayPairs[index]?.id),
    }));
  }

  protected canRegisterPairMatchResult(
    matchId: string,
    pairMatch: BackofficePairMatch | null,
  ): boolean {
    if (!pairMatch || pairMatch.setsResult.length > 0) {
      return false;
    }

    return this.matchdayMatches().find((match) => match.id === matchId)?.status === 'in_progress';
  }

  protected pairResultActionHint(matchId: string, pairMatch: BackofficePairMatch | null): string {
    if (!pairMatch) {
      return 'Genera los enfrentamientos de parejas para registrar el resultado de este partido.';
    }

    if (pairMatch.setsResult.length > 0) {
      return 'Resultado cerrado.';
    }

    const match = this.matchdayMatches().find((candidate) => candidate.id === matchId);
    return match?.status === 'in_progress'
      ? 'Pendiente de registrar.'
      : 'Inicia el partido para registrar el resultado de este cruce.';
  }

  private async loadMatchdayContext(forceRefresh = false): Promise<void> {
    if (this.isAdmin()) {
      await this.lineupsStore.loadForMatchday(this.matchdayId(), forceRefresh);
      await this.adminOperationsStore.loadPairMatches(true);
      return;
    }

    const teamId = this.sessionStore.currentPresidentTeamId();

    if (!teamId) {
      return;
    }

    await this.lineupsStore.loadForMatchdayAndTeam(this.matchdayId(), teamId, forceRefresh);
  }

  private pairMatchesForPairs(
    localPairs: readonly BackofficeLineupPair[],
    awayPairs: readonly BackofficeLineupPair[],
  ): readonly BackofficePairMatch[] {
    const localPairIds = new Set(localPairs.map((pair) => pair.id));
    const awayPairIds = new Set(awayPairs.map((pair) => pair.id));

    return this.adminOperationsStore
      .pairMatches()
      .filter(
        (pairMatch) =>
          localPairIds.has(pairMatch.localLineUpPairId) &&
          awayPairIds.has(pairMatch.awayLineUpPairId),
      );
  }

  private matchOperationFor(matchId: string): BackofficeMatchOperationViewModel | null {
    return this.matchOperationSummaries().find((summary) => summary.match.id === matchId) ?? null;
  }

  private createGuardrail(
    disabled: boolean,
    reason: string | null = null,
  ): ActionGuardrailViewModel {
    return { disabled, reason };
  }

  private scrollToMatches(): void {
    this.document
      .getElementById('matchday-matches')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
