import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

export interface BackofficeLineupDraftPairInput {
  readonly player1Id: string | null;
  readonly player2Id: string | null;
}

@Injectable()
export class BackofficeLineupsStore {
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);
  private readonly loadLineupsUseCase = inject(LoadBackofficeLineupsUseCase);

  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly lineups = signal<readonly BackofficeLineup[]>([]);
  readonly pairs = signal<readonly BackofficeLineupPair[]>([]);
  readonly isLoading = signal(false);
  readonly isSavingDraft = signal(false);
  readonly isSubmittingLineup = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly currentContextKey = signal<string | null>(null);
  readonly resolvedContextKey = signal<string | null>(null);

  private _loadedMatchdayId: string | null = null;
  private _loadedTeamId: string | null = null;

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

  async saveDraft(
    matchId: string,
    teamId: string,
    draftPairs: readonly BackofficeLineupDraftPairInput[],
    options: { readonly canCreateLineup: boolean },
  ): Promise<void> {
    this.isSavingDraft.set(true);

    try {
      await this.persistDraft(matchId, teamId, draftPairs, options);
      await this.refreshCurrentContext();
    } finally {
      this.isSavingDraft.set(false);
    }
  }

  async submitDraft(
    matchId: string,
    teamId: string,
    draftPairs: readonly BackofficeLineupDraftPairInput[],
    options: { readonly canCreateLineup: boolean },
  ): Promise<void> {
    this.isSubmittingLineup.set(true);

    try {
      const lineup = await this.persistDraft(matchId, teamId, draftPairs, options);
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
    options: { readonly canCreateLineup: boolean },
  ): Promise<BackofficeLineup> {
    let lineup = this.lineupForMatch(matchId, teamId);

    if (!lineup) {
      if (!options.canCreateLineup) {
        throw new Error('lineup_creation_not_allowed');
      }

      lineup = await this.loadLineupsUseCase.create(matchId, teamId);
    }

    const existingPairs = this.pairsForLineup(lineup.id);

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

    if (this._loadedTeamId) {
      await this.loadForTeam(this._loadedTeamId, true);
    }
  }
}
