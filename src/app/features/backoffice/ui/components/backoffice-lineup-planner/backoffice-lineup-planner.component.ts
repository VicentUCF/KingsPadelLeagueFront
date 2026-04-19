import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';

import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import {
  BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT,
  BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT,
  createBackofficeLineupOperationViewModel,
} from '../../models/backoffice-lineup-operation.viewmodel';

interface PlannerPair {
  readonly id: string;
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

interface BackofficeLineupPlannerSubmittedValue {
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

@Component({
  selector: 'app-backoffice-lineup-planner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-lineup-planner' },
  templateUrl: './backoffice-lineup-planner.component.html',
  styleUrl: './backoffice-lineup-planner.component.scss',
})
export class BackofficeLineupPlannerComponent {
  readonly matchTitle = input.required<string>();
  readonly teamName = input.required<string>();
  readonly players = input<readonly BackofficePlayer[]>([]);
  readonly lineup = input<BackofficeLineup | null>(null);
  readonly pairs = input<readonly BackofficeLineupPair[]>([]);
  readonly isSubmitting = input(false);

  readonly closed = output<void>();
  readonly submitted = output<readonly BackofficeLineupPlannerSubmittedValue[]>();

  protected readonly requiredPlayerCount = BACKOFFICE_REQUIRED_LINEUP_PLAYER_COUNT;
  protected readonly plannerStep = signal<1 | 2>(1);
  protected readonly availability = signal<Record<string, 'available' | 'unavailable'>>({});
  protected readonly plannerPairs = signal<PlannerPair[]>(createEmptyPlannerPairs());
  protected readonly playerSearch = signal('');
  protected readonly selectedPlayerId = signal<string | null>(null);
  protected readonly dragOverSlot = signal<string | null>(null);

  protected readonly validation = computed(() =>
    createBackofficeLineupOperationViewModel({
      lineup: this.lineup(),
      pairs: this.plannerPairs(),
      teamPlayers: this.players(),
    }),
  );

  protected readonly availableCount = computed(
    () => Object.values(this.availability()).filter((state) => state === 'available').length,
  );

  protected readonly assignedIds = computed(() => {
    const ids = new Set<string>();

    for (const pair of this.plannerPairs()) {
      if (pair.player1Id) {
        ids.add(pair.player1Id);
      }

      if (pair.player2Id) {
        ids.add(pair.player2Id);
      }
    }

    return ids;
  });

  protected readonly assignedCount = computed(() => this.assignedIds().size);

  protected readonly availablePlayers = computed(() => {
    const assignedIds = this.assignedIds();

    return this.players().filter(
      (player) => this.availability()[player.id] === 'available' && !assignedIds.has(player.id),
    );
  });

  protected readonly filteredAvailablePlayers = computed(() => {
    const searchTerm = this.playerSearch().trim().toLowerCase();

    if (!searchTerm) {
      return this.availablePlayers();
    }

    return this.availablePlayers().filter((player) =>
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchTerm),
    );
  });

  protected readonly validationMessages = computed(() => this.validation().reasons);
  protected readonly readOnlyMessage = computed(() => this.validation().lockReason);

  constructor() {
    effect(() => {
      const nextPairs = this.pairs()
        .slice(0, BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT)
        .map((pair, index) => ({
          id: `pair-${index + 1}`,
          player1Id: pair.player1Id,
          player2Id: pair.player2Id,
        }));

      this.plannerPairs.set(
        nextPairs.length > 0 ? fillMissingPlannerPairs(nextPairs) : createEmptyPlannerPairs(),
      );
      this.availability.set(
        Object.fromEntries(this.players().map((player) => [player.id, 'available' as const])),
      );
      this.plannerStep.set(nextPairs.length > 0 ? 2 : 1);
      this.playerSearch.set('');
      this.selectedPlayerId.set(null);
      this.dragOverSlot.set(null);
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected goToStep(step: 1 | 2): void {
    this.plannerStep.set(step);
  }

  protected availabilityFor(playerId: string): 'available' | 'unavailable' {
    return this.availability()[playerId] ?? 'available';
  }

  protected setAvailability(playerId: string, state: 'available' | 'unavailable'): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.availability.update((availability) => ({ ...availability, [playerId]: state }));

    if (state === 'unavailable' && this.selectedPlayerId() === playerId) {
      this.selectedPlayerId.set(null);
    }
  }

  protected onSearchInput(event: Event): void {
    const element = event.target;

    if (element instanceof HTMLInputElement) {
      this.playerSearch.set(element.value);
    }
  }

  protected selectPlayerMobile(playerId: string): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.selectedPlayerId.update((currentPlayerId) =>
      currentPlayerId === playerId ? null : playerId,
    );
  }

  protected assignSelectedToSlot(pairIndex: number, slot: 'player1' | 'player2'): void {
    if (this.validation().lineupLocked) {
      return;
    }

    const playerId = this.selectedPlayerId();

    if (!playerId) {
      return;
    }

    this.assignPlayerToSlot(playerId, pairIndex, slot);
    this.selectedPlayerId.set(null);
  }

  protected onDragStart(event: DragEvent, playerId: string): void {
    event.dataTransfer?.setData('text/plain', `player:${playerId}`);
  }

  protected onDrop(event: DragEvent, pairIndex: number, slot: 'player1' | 'player2'): void {
    if (this.validation().lineupLocked) {
      return;
    }

    event.preventDefault();
    const data = event.dataTransfer?.getData('text/plain') ?? '';

    if (!data.startsWith('player:')) {
      return;
    }

    this.assignPlayerToSlot(data.slice('player:'.length), pairIndex, slot);
    this.dragOverSlot.set(null);
  }

  protected clearSlot(pairIndex: number, slot: 'player1' | 'player2'): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.plannerPairs.update((pairs) =>
      pairs.map((pair, currentIndex) =>
        currentIndex === pairIndex ? { ...pair, [`${slot}Id`]: null } : pair,
      ),
    );
  }

  protected clearPair(pairIndex: number): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.plannerPairs.update((pairs) =>
      pairs.map((pair, currentIndex) =>
        currentIndex === pairIndex ? { ...pair, player1Id: null, player2Id: null } : pair,
      ),
    );
  }

  protected swapPair(pairIndex: number): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.plannerPairs.update((pairs) =>
      pairs.map((pair, currentIndex) =>
        currentIndex === pairIndex
          ? {
              ...pair,
              player1Id: pair.player2Id,
              player2Id: pair.player1Id,
            }
          : pair,
      ),
    );
  }

  protected autoAssign(): void {
    if (this.validation().lineupLocked) {
      return;
    }

    const availablePlayers = this.availablePlayers();

    if (availablePlayers.length === 0) {
      return;
    }

    let availableIndex = 0;

    this.plannerPairs.update((pairs) =>
      pairs.map((pair) => {
        let { player1Id, player2Id } = pair;

        if (!player1Id && availableIndex < availablePlayers.length) {
          player1Id = availablePlayers[availableIndex++]!.id;
        }

        if (!player2Id && availableIndex < availablePlayers.length) {
          player2Id = availablePlayers[availableIndex++]!.id;
        }

        return { ...pair, player1Id, player2Id };
      }),
    );
  }

  protected playerById(playerId: string | null): BackofficePlayer | null {
    if (!playerId) {
      return null;
    }

    return this.players().find((player) => player.id === playerId) ?? null;
  }

  protected playerAvatarPath(player: BackofficePlayer): string | null {
    return resolvePlayerAvatarPath(player.profileImage);
  }

  protected positionLabel(position: BackofficePlayer['preferredPosition']): string {
    switch (position) {
      case 'left':
        return 'Reves';
      case 'right':
        return 'Drive';
      case 'both':
        return 'Ambas';
    }
  }

  protected totalGames(player: BackofficePlayer): number {
    return player.wonGames + player.lostGames;
  }

  protected submitLineup(): void {
    if (!this.validation().lineupReadyForSubmit || this.isSubmitting()) {
      return;
    }

    this.submitted.emit(
      this.plannerPairs().map((pair) => ({
        player1Id: pair.player1Id,
        player2Id: pair.player2Id,
      })),
    );
  }

  private assignPlayerToSlot(
    playerId: string,
    pairIndex: number,
    slot: 'player1' | 'player2',
  ): void {
    if (this.validation().lineupLocked) {
      return;
    }

    this.plannerPairs.update((pairs) =>
      pairs.map((pair) => ({
        ...pair,
        player1Id: pair.player1Id === playerId ? null : pair.player1Id,
        player2Id: pair.player2Id === playerId ? null : pair.player2Id,
      })),
    );
    this.plannerPairs.update((pairs) =>
      pairs.map((pair, currentIndex) =>
        currentIndex === pairIndex ? { ...pair, [`${slot}Id`]: playerId } : pair,
      ),
    );
  }
}

function createEmptyPlannerPairs(): PlannerPair[] {
  return Array.from({ length: BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT }, (_, index) => ({
    id: `pair-${index + 1}`,
    player1Id: null,
    player2Id: null,
  }));
}

function fillMissingPlannerPairs(pairs: readonly PlannerPair[]): PlannerPair[] {
  const nextPairs = [...pairs];

  while (nextPairs.length < BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT) {
    nextPairs.push({
      id: `pair-${nextPairs.length + 1}`,
      player1Id: null,
      player2Id: null,
    });
  }

  return nextPairs;
}
