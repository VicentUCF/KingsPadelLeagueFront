import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { isBackofficeLineupPairPointOrderValid } from '@features/backoffice/domain/rules/backoffice-lineup-pair-order.rule';
import { BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT } from '../models/backoffice-lineup-operation.viewmodel';

export interface BackofficeLineupDraftPairInput {
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

const LINEUP_NOT_INITIALIZED_ERROR = 'lineup_not_initialized';
const LINEUP_LOCKED_ERROR = 'lineup_locked';
const INVALID_LINEUP_DRAFT_ERROR = 'invalid_lineup_draft';

@Injectable()
export class BackofficeLineupsStore {
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);
  private readonly loadLineupsUseCase = inject(LoadBackofficeLineupsUseCase);

  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly lineups = signal<readonly BackofficeLineup[]>([]);
  readonly pairs = signal<readonly BackofficeLineupPair[]>([]);
  readonly isLoading = signal(false);
  readonly isSubmittingLineup = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentContextKey = signal<string | null>(null);
  readonly resolvedContextKey = signal<string | null>(null);

  private _loadedMatchdayId: string | null = null;
  private _loadedTeamId: string | null = null;
  private _loadedTeamMatchdayId: string | null = null;
  private _loadedPresidentTeamId: string | null = null;

  readonly hasContent = computed(
    () =>
      this.currentContextKey() !== null && this.currentContextKey() === this.resolvedContextKey(),
  );

  async loadForMatchday(matchdayId: string, forceRefresh = false): Promise<void> {
    if (!forceRefresh && this._loadedMatchdayId === matchdayId) return;

    const contextKey = `matchday:${matchdayId}`;
    const isContextChange = this.currentContextKey() !== contextKey;

    this.currentContextKey.set(contextKey);
    if (isContextChange) {
      this.matches.set([]);
      this.lineups.set([]);
      this.pairs.set([]);
      this.resolvedContextKey.set(null);
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const matches = (await this.loadMatchesUseCase.byMatchday(matchdayId)).filter(
        (match) => match.matchdayId === matchdayId,
      );
      this.matches.set(matches);
      if (matches.length > 0) {
        const matchIds = matches.map((m) => m.id);
        const lineups = await this.loadLineupsUseCase.byMatchIds(matchIds);
        this.lineups.set(lineups);
        if (lineups.length > 0) {
          const lineupIds = lineups.map((l) => l.id);
          const pairs = await this.loadLineupsUseCase.pairsByLineupIds(lineupIds);
          this.pairs.set(pairs);
        } else {
          this.pairs.set([]);
        }
      } else {
        this.lineups.set([]);
        this.pairs.set([]);
      }
      this._loadedMatchdayId = matchdayId;
      this._loadedTeamId = null;
      this.resolvedContextKey.set(contextKey);
    } catch {
      this.errorMessage.set('No se pudieron cargar las alineaciones.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadForTeam(teamId: string, forceRefresh = false): Promise<void> {
    if (!forceRefresh && this._loadedTeamId === teamId) return;

    const contextKey = `team:${teamId}`;
    const isContextChange = this.currentContextKey() !== contextKey;

    this.currentContextKey.set(contextKey);
    if (isContextChange) {
      this.matches.set([]);
      this.lineups.set([]);
      this.pairs.set([]);
      this.resolvedContextKey.set(null);
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const matches = await this.loadMatchesUseCase.byTeam(teamId);
      this.matches.set(matches);
      if (matches.length > 0) {
        const matchIds = matches.map((m) => m.id);
        const lineups = await this.loadLineupsUseCase.byMatchIds(matchIds);
        this.lineups.set(lineups);
        if (lineups.length > 0) {
          const lineupIds = lineups.map((l) => l.id);
          const pairs = await this.loadLineupsUseCase.pairsByLineupIds(lineupIds);
          this.pairs.set(pairs);
        } else {
          this.pairs.set([]);
        }
      } else {
        this.lineups.set([]);
        this.pairs.set([]);
      }
      this._loadedTeamId = teamId;
      this._loadedMatchdayId = null;
      this._loadedTeamMatchdayId = null;
      this._loadedPresidentTeamId = null;
      this.resolvedContextKey.set(contextKey);
    } catch {
      this.errorMessage.set('No se pudieron cargar las alineaciones.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadForMatchdayAndTeam(
    matchdayId: string,
    teamId: string,
    forceRefresh = false,
  ): Promise<void> {
    if (
      !forceRefresh &&
      this._loadedTeamMatchdayId === matchdayId &&
      this._loadedPresidentTeamId === teamId
    ) {
      return;
    }

    const contextKey = `matchday-team:${matchdayId}:${teamId}`;
    const isContextChange = this.currentContextKey() !== contextKey;

    this.currentContextKey.set(contextKey);
    if (isContextChange) {
      this.matches.set([]);
      this.lineups.set([]);
      this.pairs.set([]);
      this.resolvedContextKey.set(null);
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const matches = (await this.loadMatchesUseCase.byMatchdayAndTeam(matchdayId, teamId)).filter(
        (match) =>
          match.matchdayId === matchdayId &&
          (match.localTeamId === teamId || match.awayTeamId === teamId),
      );
      this.matches.set(matches);

      if (matches.length > 0) {
        const matchIds = matches.map((match) => match.id);
        const lineups = await this.loadLineupsUseCase.byMatchIdsAndTeamIds(matchIds, [teamId]);
        this.lineups.set(lineups);

        if (lineups.length > 0) {
          const lineupIds = lineups.map((lineup) => lineup.id);
          const pairs = await this.loadLineupsUseCase.pairsByLineupIds(lineupIds);
          this.pairs.set(pairs);
        } else {
          this.pairs.set([]);
        }
      } else {
        this.lineups.set([]);
        this.pairs.set([]);
      }

      this._loadedTeamMatchdayId = matchdayId;
      this._loadedPresidentTeamId = teamId;
      this._loadedMatchdayId = null;
      this._loadedTeamId = null;
      this.resolvedContextKey.set(contextKey);
    } catch {
      this.errorMessage.set('No se pudieron cargar las alineaciones.');
    } finally {
      this.isLoading.set(false);
    }
  }

  lineupForMatch(matchId: string, teamId: string): BackofficeLineup | undefined {
    return this.lineups().find((l) => l.matchId === matchId && l.teamId === teamId);
  }

  pairsForLineup(lineupId: string): readonly BackofficeLineupPair[] {
    return this.pairs().filter((p) => p.lineupId === lineupId);
  }

  async submitDraft(
    matchId: string,
    teamId: string,
    draftPairs: readonly BackofficeLineupDraftPairInput[],
    teamPlayers: readonly BackofficePlayer[],
  ): Promise<void> {
    this.isSubmittingLineup.set(true);

    try {
      const lineup = await this.persistDraft(matchId, teamId, draftPairs, teamPlayers);
      await this.loadLineupsUseCase.submit(lineup.id);
      await this.refreshCurrentContext();
    } finally {
      this.isSubmittingLineup.set(false);
    }
  }

  private async persistDraft(
    matchId: string,
    teamId: string,
    draftPairs: readonly BackofficeLineupDraftPairInput[],
    teamPlayers: readonly BackofficePlayer[],
  ): Promise<BackofficeLineup> {
    if (
      draftPairs.length !== BACKOFFICE_REQUIRED_LINEUP_PAIR_COUNT ||
      draftPairs.some((pair) => !pair.player1Id || !pair.player2Id) ||
      !isBackofficeLineupPairPointOrderValid(draftPairs, teamPlayers)
    ) {
      throw new Error(INVALID_LINEUP_DRAFT_ERROR);
    }

    const lineup = await this.loadLineupsUseCase.findByMatchAndTeam(matchId, teamId);

    if (!lineup) {
      throw new Error(LINEUP_NOT_INITIALIZED_ERROR);
    }

    if (lineup.status !== 'pending') {
      throw new Error(LINEUP_LOCKED_ERROR);
    }

    const existingPairs = await this.loadLineupsUseCase.pairsByLineupIds([lineup.id]);

    for (const [index, draftPair] of draftPairs.entries()) {
      const existingPair = existingPairs[index];

      if (existingPair) {
        await this.loadLineupsUseCase.updatePair(
          existingPair.id,
          draftPair.player1Id,
          draftPair.player2Id,
        );
        continue;
      }

      if (draftPair.player1Id && draftPair.player2Id) {
        await this.loadLineupsUseCase.createPair(
          lineup.id,
          draftPair.player1Id,
          draftPair.player2Id,
        );
      }
    }

    return lineup;
  }

  private async refreshCurrentContext(): Promise<void> {
    if (this._loadedMatchdayId) {
      await this.loadForMatchday(this._loadedMatchdayId, true);
      return;
    }

    if (this._loadedTeamMatchdayId && this._loadedPresidentTeamId) {
      await this.loadForMatchdayAndTeam(
        this._loadedTeamMatchdayId,
        this._loadedPresidentTeamId,
        true,
      );
      return;
    }

    if (this._loadedTeamId) {
      await this.loadForTeam(this._loadedTeamId, true);
    }
  }
}
