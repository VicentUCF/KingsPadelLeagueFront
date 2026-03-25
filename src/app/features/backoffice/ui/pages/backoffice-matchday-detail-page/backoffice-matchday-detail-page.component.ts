import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import type {
  BackofficePlayer,
  BackofficePlayerPosition,
} from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';
import { ActionToastStore } from '@core/state/action-toast.store';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import {
  toBackofficeMatchCardViewModel,
  type BackofficeMatchCardViewModel,
} from '../../models/backoffice-lineups.viewmodel';
import { toBackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { BackofficeMatchFormDialogComponent } from '../../components/backoffice-match-form-dialog/backoffice-match-form-dialog.component';
import { BackofficePairMatchResultDialogComponent } from '../../components/backoffice-pair-match-result-dialog/backoffice-pair-match-result-dialog.component';

interface PlannerPair {
  id: string;
  player1Id: string | null;
  player2Id: string | null;
}

interface MatchPairSlotViewModel {
  readonly order: 1 | 2;
  readonly label: string;
  readonly pointsLabel: string;
  readonly localPair:
    | ReturnType<BackofficeMatchdayDetailPageComponent['pairsForMatchTeam']>[number]
    | null;
  readonly awayPair:
    | ReturnType<BackofficeMatchdayDetailPageComponent['pairsForMatchTeam']>[number]
    | null;
  readonly pairMatch: BackofficePairMatch | null;
}

type ConfirmActionKind =
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
    LoadFeedbackComponent,
    LoadingStateComponent,
    RouterLink,
    StatusBadgeComponent,
    ConfirmActionDialogComponent,
    BackofficeMatchFormDialogComponent,
    BackofficePairMatchResultDialogComponent,
  ],
  templateUrl: './backoffice-matchday-detail-page.component.html',
  styleUrl: './backoffice-matchday-detail-page.component.scss',
})
export class BackofficeMatchdayDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly lineupsStore = inject(BackofficeLineupsStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  protected readonly adminOperationsStore = inject(BackofficeAdminMatchdayOperationsStore);
  private readonly toastStore = inject(ActionToastStore);

  protected readonly matchdayId = signal('');
  protected readonly hasContent = computed(
    () =>
      this.matchdaysStore.hasContent() &&
      this.teamsStore.hasContent() &&
      this.lineupsStore.hasContent(),
  );
  protected readonly pageErrorMessage = computed(
    () =>
      this.matchdaysStore.errorMessage() ??
      this.teamsStore.errorMessage() ??
      this.lineupsStore.errorMessage() ??
      this.playersStore.errorMessage() ??
      this.adminOperationsStore.pairMatchesErrorMessage(),
  );

  protected readonly matchday = computed(
    () => this.matchdaysStore.matchdays().find((m) => m.id === this.matchdayId()) ?? null,
  );

  protected readonly matchdayRow = computed(() => {
    const m = this.matchday();
    return m ? toBackofficeMatchdayRowViewModel(m) : null;
  });

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly isMatchdayFinished = computed(() => this.matchday()?.status === 'finished');

  protected readonly presidentTeam = computed<BackofficeTeam | null>(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    return this.teamsStore.teams().find((t) => t.id === teamId) ?? null;
  });

  protected readonly matchCards = computed<readonly BackofficeMatchCardViewModel[]>(() => {
    const currentMatchdayId = this.matchdayId();
    const matches = this.lineupsStore
      .matches()
      .filter((match) => match.matchdayId === currentMatchdayId);
    const teams = this.teamsStore.teams();
    const lineups = this.lineupsStore.lineups();

    const filtered = this.isAdmin()
      ? matches
      : matches.filter((m) => {
          const presidentTeamId = this.sessionStore.currentPresidentTeamId();
          return m.localTeamId === presidentTeamId || m.awayTeamId === presidentTeamId;
        });

    return filtered
      .map((match) => {
        const localTeam = teams.find((t) => t.id === match.localTeamId);
        const awayTeam = teams.find((t) => t.id === match.awayTeamId);
        if (!localTeam || !awayTeam) return null;
        const lineup = lineups.find((l) => l.matchId === match.id);
        return toBackofficeMatchCardViewModel(match, localTeam, awayTeam, lineup);
      })
      .filter((card): card is BackofficeMatchCardViewModel => card !== null);
  });

  protected readonly confirmAction = signal<{
    kind: ConfirmActionKind;
    matchId?: string;
    title: string;
    description: string;
    confirmLabel: string;
  } | null>(null);
  protected readonly isCreateMatchDialogOpen = signal(false);
  protected readonly editingPairMatchId = signal<string | null>(null);

  // ── Planner state ────────────────────────────────────────────────────────
  protected readonly selectedMatchId = signal<string | null>(null);
  protected readonly plannerTeamId = signal<string | null>(null);
  protected readonly plannerStep = signal<1 | 2>(1);
  protected readonly availability = signal<Record<string, 'available' | 'unavailable'>>({});
  protected readonly plannerPairs = signal<PlannerPair[]>([]);
  protected readonly playerSearch = signal('');
  protected readonly selectedPlayerId = signal<string | null>(null);
  protected readonly dragOverSlot = signal<string | null>(null);

  protected readonly plannerPlayers = computed(() => {
    const teamId = this.plannerTeamId();
    if (!teamId) return [];
    return this.playersStore.players().filter((p) => p.teamId === teamId);
  });

  protected readonly availableCount = computed(
    () => Object.values(this.availability()).filter((s) => s === 'available').length,
  );

  protected readonly assignedIds = computed(() => {
    const ids = new Set<string>();
    this.plannerPairs().forEach((pair) => {
      if (pair.player1Id) ids.add(pair.player1Id);
      if (pair.player2Id) ids.add(pair.player2Id);
    });
    return ids;
  });

  protected readonly assignedCount = computed(() => this.assignedIds().size);
  protected readonly requiredPlayers = computed(() => 4);

  protected readonly availablePlayers = computed(() => {
    const assigned = this.assignedIds();
    return this.plannerPlayers().filter(
      (p) => this.availability()[p.id] === 'available' && !assigned.has(p.id),
    );
  });

  protected readonly filteredAvailablePlayers = computed(() => {
    const term = this.playerSearch().toLowerCase();
    if (!term) return this.availablePlayers();
    return this.availablePlayers().filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(term),
    );
  });

  protected readonly plannerMatchTitle = computed(() => {
    const matchId = this.selectedMatchId();
    const match = this.lineupsStore.matches().find((m) => m.id === matchId);
    if (!match) return 'Partido';
    const teams = this.teamsStore.teams();
    const local = teams.find((t) => t.id === match.localTeamId)?.name ?? 'Local';
    const away = teams.find((t) => t.id === match.awayTeamId)?.name ?? 'Visitante';
    const date =
      match.scheduledAt instanceof Date
        ? match.scheduledAt.toLocaleDateString('es-ES', {
            weekday: 'short',
            day: 'numeric',
            month: 'short',
          })
        : String(match.scheduledAt);
    return `${local} vs ${away} · ${date}`;
  });

  protected readonly plannerTeamName = computed(() => {
    const teamId = this.plannerTeamId();
    if (!teamId) return '';
    return this.teamsStore.teams().find((t) => t.id === teamId)?.name ?? '';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('matchdayId') ?? '';
    this.matchdayId.set(id);
    void this.matchdaysStore.load();
    void this.teamsStore.load();
    void this.playersStore.load();
    void this.lineupsStore.loadForMatchday(id).then(() => {
      if (this.isAdmin()) {
        void this.adminOperationsStore.loadPairMatches(true);
      }
    });
  }

  protected reloadPage(): void {
    const id = this.matchdayId();
    void Promise.all([
      this.matchdaysStore.load(true),
      this.teamsStore.load(true),
      this.playersStore.load(true),
      this.lineupsStore.loadForMatchday(id, true),
    ]).then(() => {
      if (this.isAdmin()) {
        void this.adminOperationsStore.loadPairMatches(true);
      }
    });
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
    if (!action) return;

    const matchdayId = this.matchdayId();
    switch (action.kind) {
      case 'start-matchday':
        await this.adminOperationsStore.startMatchday(matchdayId);
        break;
      case 'finish-matchday':
        await this.adminOperationsStore.finishMatchday(matchdayId);
        break;
      case 'create-pair-matches':
        await this.adminOperationsStore.createPairMatches(matchdayId);
        break;
      case 'start-match':
        if (action.matchId) await this.adminOperationsStore.startMatch(matchdayId, action.matchId);
        break;
      case 'finish-match':
        if (action.matchId) await this.adminOperationsStore.finishMatch(matchdayId, action.matchId);
        break;
    }

    this.closeConfirmAction();
  }

  protected openCreateMatchDialog(): void {
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
    await this.adminOperationsStore.createMatch({
      matchdayId: this.matchdayId(),
      localTeamId: input.localTeamId,
      awayTeamId: input.awayTeamId,
      scheduledAt: input.scheduledAt,
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
      mvpId: null,
    });
    this.closeCreateMatchDialog();
  }

  protected async updateMvp(matchId: string, currentMvpId: string | null): Promise<void> {
    const playerId = globalThis.prompt('ID del MVP', currentMvpId ?? '')?.trim();
    if (playerId === undefined) return;
    await this.adminOperationsStore.updateMatchMvp(
      this.matchdayId(),
      matchId,
      playerId.length > 0 ? playerId : null,
    );
  }

  protected openPairMatchResultDialog(pairMatchId: string): void {
    this.editingPairMatchId.set(pairMatchId);
  }

  protected closePairMatchResultDialog(): void {
    this.editingPairMatchId.set(null);
  }

  protected async savePairMatchResult(input: {
    readonly setsResult: readonly { readonly local: number; readonly away: number }[];
  }): Promise<void> {
    const pairMatchId = this.editingPairMatchId();
    if (!pairMatchId) return;
    await this.adminOperationsStore.finishPairMatch(this.matchdayId(), pairMatchId, input);
    this.closePairMatchResultDialog();
  }

  protected readonly currentEditingPairMatch = computed<BackofficePairMatch | null>(
    () =>
      this.adminOperationsStore
        .pairMatches()
        .find((pairMatch) => pairMatch.id === this.editingPairMatchId()) ?? null,
  );

  protected pairMatchForPairIds(
    localPairId: string | null | undefined,
    awayPairId: string | null | undefined,
  ): BackofficePairMatch | null {
    if (!localPairId || !awayPairId) return null;
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
    if (!pairMatch || pairMatch.setsResult.length === 0) return 'Sin resultado';
    return pairMatch.setsResult.map((set) => `${set.local}-${set.away}`).join(' · ');
  }

  protected matchStatusLabel(
    status: BackofficeMatchCardViewModel['lineupStatus'] | 'scheduled' | 'in_progress' | 'finished',
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
        return 'Sin alineación';
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

  protected openPlanner(matchId: string, teamId: string): void {
    this.selectedMatchId.set(matchId);
    this.plannerTeamId.set(teamId);
    this.selectedPlayerId.set(null);
    this.playerSearch.set('');

    const existingLineup = this.lineupsStore.lineupForMatch(matchId, teamId);
    const existingPairs = existingLineup ? this.lineupsStore.pairsForLineup(existingLineup.id) : [];

    const initAvail: Record<string, 'available'> = {};
    this.playersStore
      .players()
      .filter((p) => p.teamId === teamId)
      .forEach((p) => {
        initAvail[p.id] = 'available';
      });
    this.availability.set(initAvail);

    if (existingPairs.length > 0) {
      const pairs: PlannerPair[] = existingPairs.slice(0, 2).map((p, i) => ({
        id: `pair-${i + 1}`,
        player1Id: p.player1Id,
        player2Id: p.player2Id,
      }));
      while (pairs.length < 2) {
        pairs.push({ id: `pair-${pairs.length + 1}`, player1Id: null, player2Id: null });
      }
      this.plannerPairs.set(pairs);
      this.plannerStep.set(2);
    } else {
      this.plannerPairs.set([
        { id: 'pair-1', player1Id: null, player2Id: null },
        { id: 'pair-2', player1Id: null, player2Id: null },
      ]);
      this.plannerStep.set(1);
    }
  }

  protected closePlanner(): void {
    this.selectedMatchId.set(null);
  }

  protected availabilityFor(playerId: string): 'available' | 'unavailable' {
    return this.availability()[playerId] ?? 'available';
  }

  protected setAvailability(playerId: string, state: 'available' | 'unavailable'): void {
    this.availability.update((a) => ({ ...a, [playerId]: state }));
    if (state === 'unavailable' && this.selectedPlayerId() === playerId) {
      this.selectedPlayerId.set(null);
    }
  }

  protected goToStep(step: 1 | 2): void {
    this.plannerStep.set(step);
  }

  protected selectPlayerMobile(playerId: string): void {
    this.selectedPlayerId.update((current) => (current === playerId ? null : playerId));
  }

  protected assignSelectedToSlot(pairIndex: number, slot: 'player1' | 'player2'): void {
    const playerId = this.selectedPlayerId();
    if (!playerId) return;
    this.assignPlayerToSlot(playerId, pairIndex, slot);
    this.selectedPlayerId.set(null);
  }

  protected onDragStart(event: DragEvent, playerId: string): void {
    event.dataTransfer?.setData('text/plain', `player:${playerId}`);
  }

  protected onDrop(event: DragEvent, pairIndex: number, slot: 'player1' | 'player2'): void {
    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain') ?? '';
    if (!data.startsWith('player:')) return;
    const playerId = data.slice('player:'.length);
    this.assignPlayerToSlot(playerId, pairIndex, slot);
    this.dragOverSlot.set(null);
  }

  protected clearSlot(pairIndex: number, slot: 'player1' | 'player2'): void {
    this.plannerPairs.update((pairs) =>
      pairs.map((p, i) => (i === pairIndex ? { ...p, [`${slot}Id`]: null } : p)),
    );
  }

  protected clearPair(pairIndex: number): void {
    this.plannerPairs.update((pairs) =>
      pairs.map((p, i) => (i === pairIndex ? { ...p, player1Id: null, player2Id: null } : p)),
    );
  }

  protected swapPair(pairIndex: number): void {
    this.plannerPairs.update((pairs) =>
      pairs.map((p, i) =>
        i === pairIndex ? { ...p, player1Id: p.player2Id, player2Id: p.player1Id } : p,
      ),
    );
  }

  protected autoAssign(): void {
    const available = this.availablePlayers();
    if (!available.length) return;
    let avIdx = 0;
    this.plannerPairs.update((pairs) =>
      pairs.map((pair) => {
        let { player1Id, player2Id } = pair;
        if (!player1Id && avIdx < available.length) player1Id = available[avIdx++]!.id;
        if (!player2Id && avIdx < available.length) player2Id = available[avIdx++]!.id;
        return { ...pair, player1Id, player2Id };
      }),
    );
  }

  protected playerById(playerId: string | null): BackofficePlayer | null {
    if (!playerId) return null;
    return this.playersStore.players().find((p) => p.id === playerId) ?? null;
  }

  protected playerAvatarPath(player: BackofficePlayer): string | null {
    return resolvePlayerAvatarPath(player.profileImage);
  }

  protected pairsForMatchTeam(matchId: string, teamId: string) {
    const lineup = this.lineupsStore.lineupForMatch(matchId, teamId);
    if (!lineup) return [];
    return this.lineupsStore.pairsForLineup(lineup.id);
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

  protected totalGames(player: BackofficePlayer): number {
    return player.wonGames + player.lostGames;
  }

  protected saveDraft(): void {
    this.toastStore.success(
      'El borrador de alineación se ha guardado correctamente.',
      'Borrador guardado',
    );
  }

  private assignPlayerToSlot(
    playerId: string,
    pairIndex: number,
    slot: 'player1' | 'player2',
  ): void {
    this.plannerPairs.update((pairs) =>
      pairs.map((p) => ({
        ...p,
        player1Id: p.player1Id === playerId ? null : p.player1Id,
        player2Id: p.player2Id === playerId ? null : p.player2Id,
      })),
    );
    this.plannerPairs.update((pairs) =>
      pairs.map((p, i) => (i === pairIndex ? { ...p, [`${slot}Id`]: playerId } : p)),
    );
  }
}
