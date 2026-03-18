import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';

import { ChevronDown, LucideAngularModule } from 'lucide-angular';

import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { ActionToastStore } from '@core/state/action-toast.store';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import {
  toBackofficeMatchCardViewModel,
  type BackofficeMatchCardViewModel,
} from '../../models/backoffice-lineups.viewmodel';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

interface PlannerPair {
  id: string;
  player1Id: string | null;
  player2Id: string | null;
}

@Component({
  selector: 'app-backoffice-lineups-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-lineups-page' },
  imports: [
    LoadFeedbackComponent,
    LoadingStateComponent,
    LucideAngularModule,
    StatusBadgeComponent,
  ],
  templateUrl: './backoffice-lineups-page.component.html',
  styleUrl: './backoffice-lineups-page.component.scss',
})
export class BackofficeLineupsPageComponent implements OnInit {
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly lineupsStore = inject(BackofficeLineupsStore);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);
  private readonly toastStore = inject(ActionToastStore);

  protected readonly selectedMatchdayId = signal<string | null>(null);
  protected readonly hasContent = computed(() => {
    if (this.isAdmin()) {
      return this.matchdaysStore.hasContent() && this.lineupsStore.hasContent();
    }

    return this.teamsStore.hasContent() && this.lineupsStore.hasContent();
  });
  protected readonly pageErrorMessage = computed(
    () =>
      this.lineupsStore.errorMessage() ??
      this.matchdaysStore.errorMessage() ??
      this.teamsStore.errorMessage() ??
      this.playersStore.errorMessage(),
  );

  // Planner signals
  protected readonly selectedMatchId = signal<string | null>(null);
  protected readonly plannerTeamId = signal<string | null>(null);
  protected readonly plannerStep = signal<1 | 2>(1);
  protected readonly availability = signal<Record<string, 'available' | 'unavailable'>>({});
  protected readonly plannerPairs = signal<PlannerPair[]>([]);
  protected readonly playerSearch = signal('');
  protected readonly selectedPlayerId = signal<string | null>(null);
  protected readonly dragOverSlot = signal<string | null>(null);

  protected readonly matchCards = computed<readonly BackofficeMatchCardViewModel[]>(() => {
    const matches = this.lineupsStore.matches();
    const teams = this.teamsStore.teams();
    const lineups = this.lineupsStore.lineups();

    return matches
      .map((match) => {
        const localTeam = teams.find((t) => t.id === match.localTeamId);
        const awayTeam = teams.find((t) => t.id === match.awayTeamId);
        if (!localTeam || !awayTeam) return null;

        const lineup = lineups.find((l) => l.matchId === match.id);
        return toBackofficeMatchCardViewModel(match, localTeam, awayTeam, lineup);
      })
      .filter((card): card is BackofficeMatchCardViewModel => card !== null);
  });

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');

  protected readonly presidentTeam = computed<BackofficeTeam | null>(() => {
    const teamId = this.sessionStore.currentPresidentTeamId();
    return this.teamsStore.teams().find((t) => t.id === teamId) ?? null;
  });

  // Planner computed
  protected readonly plannerMatch = computed(
    () => this.lineupsStore.matches().find((m) => m.id === this.selectedMatchId()) ?? null,
  );

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
  protected readonly pairsCount = computed(() => 3);
  protected readonly requiredPlayers = computed(() => this.pairsCount() * 2);

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
    const match = this.plannerMatch();
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

  ngOnInit(): void {
    const matchdaysLoad = this.matchdaysStore.load();
    const teamsLoad = this.teamsStore.load();
    const playersLoad = this.playersStore.load();

    if (this.sessionStore.currentRole() === 'ADMIN') {
      void matchdaysLoad.then(() => this.loadForCurrentMatchday());
    } else {
      void Promise.all([teamsLoad, playersLoad]).then(() => this.loadForPresidentTeam());
    }
  }

  protected onMatchdayChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = select.value;
    this.selectedMatchdayId.set(id || null);
    if (id) {
      void this.lineupsStore.loadForMatchday(id);
    }
  }

  protected reloadData(): void {
    if (this.isAdmin()) {
      const selectedMatchdayId = this.selectedMatchdayId();
      void Promise.all([
        this.matchdaysStore.load(true),
        this.teamsStore.load(true),
        this.playersStore.load(true),
      ]).then(() => {
        const matchdayId = selectedMatchdayId ?? this.selectedMatchdayId();
        if (matchdayId) {
          void this.lineupsStore.loadForMatchday(matchdayId, true);
        } else {
          this.loadForCurrentMatchday();
        }
      });
      return;
    }

    void Promise.all([this.teamsStore.load(true), this.playersStore.load(true)]).then(() => {
      const team = this.presidentTeam();
      if (team) {
        void this.lineupsStore.loadForTeam(team.id, true);
      }
    });
  }

  protected openPlanner(matchId: string, teamId: string): void {
    this.selectedMatchId.set(matchId);
    this.plannerTeamId.set(teamId);
    this.plannerStep.set(1);
    this.plannerPairs.set([
      { id: 'pair-1', player1Id: null, player2Id: null },
      { id: 'pair-2', player1Id: null, player2Id: null },
      { id: 'pair-3', player1Id: null, player2Id: null },
    ]);
    const initAvail: Record<string, 'available'> = {};
    this.playersStore
      .players()
      .filter((p) => p.teamId === teamId)
      .forEach((p) => {
        initAvail[p.id] = 'available';
      });
    this.availability.set(initAvail);
    this.selectedPlayerId.set(null);
    this.playerSearch.set('');
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
        if (!player1Id && avIdx < available.length) {
          player1Id = available[avIdx++]!.id;
        }
        if (!player2Id && avIdx < available.length) {
          player2Id = available[avIdx++]!.id;
        }
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

  protected positionLabel(pos: BackofficePlayer['preferredPosition']): string {
    switch (pos) {
      case 'left':
        return 'Revés';
      case 'right':
        return 'Drive';
      case 'both':
        return 'Ambas';
    }
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
    // Remove the player from any existing slot first
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

  private loadForCurrentMatchday(): void {
    const currentMatchday = this.matchdaysStore.currentMatchday();
    const firstMatchday = this.matchdaysStore.matchdays()[0];
    const matchday = currentMatchday ?? firstMatchday;
    if (matchday) {
      this.selectedMatchdayId.set(matchday.id);
      void this.lineupsStore.loadForMatchday(matchday.id);
    }
  }

  private loadForPresidentTeam(): void {
    const team = this.presidentTeam();
    if (team) {
      void this.lineupsStore.loadForTeam(team.id);
    }
  }
}
