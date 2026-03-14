import { inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeLineupsUseCase } from '@features/backoffice/application/use-cases/load-backoffice-lineups.use-case';
import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type {
  BackofficeLineup,
  BackofficeLineupPair,
} from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';

@Injectable()
export class BackofficeLineupsStore {
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);
  private readonly loadLineupsUseCase = inject(LoadBackofficeLineupsUseCase);

  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly lineups = signal<readonly BackofficeLineup[]>([]);
  readonly pairs = signal<readonly BackofficeLineupPair[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private _loadedMatchdayId: string | null = null;
  private _loadedTeamId: string | null = null;

  async loadForMatchday(matchdayId: string): Promise<void> {
    if (this._loadedMatchdayId === matchdayId) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const matches = await this.loadMatchesUseCase.byMatchday(matchdayId);
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
    } catch {
      this.errorMessage.set('No se pudieron cargar las alineaciones.');
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadForTeam(teamId: string): Promise<void> {
    if (this._loadedTeamId === teamId) return;
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
}
