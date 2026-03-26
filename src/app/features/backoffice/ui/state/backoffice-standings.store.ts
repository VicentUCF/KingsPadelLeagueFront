import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeMatchesUseCase } from '@features/backoffice/application/use-cases/load-backoffice-matches.use-case';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeSeasonTeamScore } from '@features/backoffice/domain/entities/backoffice-season-team-score';
import {
  toBackofficeStandingsViewModel,
  type BackofficeStandingRow,
} from '../models/backoffice-standings.viewmodel';
import { resolveCurrentBackofficeSeasonId } from '../models/backoffice-season-resolution';
import { BackofficeMatchdaysStore } from './backoffice-matchdays.store';
import { BackofficeSeasonsStore } from './backoffice-seasons.store';
import { BackofficeTeamsStore } from './backoffice-teams.store';
import { LOAD_BACKOFFICE_SEASON_TEAM_SCORES_USE_CASE } from '../providers/backoffice.providers';

@Injectable()
export class BackofficeStandingsStore {
  private readonly loadMatchesUseCase = inject(LoadBackofficeMatchesUseCase);
  private readonly loadSeasonTeamScoresUseCase = inject(
    LOAD_BACKOFFICE_SEASON_TEAM_SCORES_USE_CASE,
  );
  private readonly teamsStore = inject(BackofficeTeamsStore);
  private readonly seasonsStore = inject(BackofficeSeasonsStore);
  private readonly matchdaysStore = inject(BackofficeMatchdaysStore);

  readonly seasonScores = signal<readonly BackofficeSeasonTeamScore[]>([]);
  readonly matches = signal<readonly BackofficeMatch[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = signal(false);

  private _loaded = false;
  private _loadedSeasonId: string | null = null;

  readonly rows = computed<readonly BackofficeStandingRow[]>(() =>
    toBackofficeStandingsViewModel(this.teamsStore.teams(), this.seasonScores(), this.matches()),
  );

  readonly activeSeasonId = computed(() =>
    resolveCurrentBackofficeSeasonId(this.seasonsStore.seasons(), this.matchdaysStore.matchdays()),
  );

  readonly finishedMatchdayCount = computed(() => {
    const activeSeasonId = this.activeSeasonId();

    return this.matchdaysStore
      .matchdays()
      .filter(
        (matchday) =>
          matchday.status === 'finished' &&
          (activeSeasonId === null || matchday.seasonId === activeSeasonId),
      ).length;
  });

  readonly currentMatchday = computed(() => this.matchdaysStore.currentMatchday());

  async load(forceRefresh = false): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      await Promise.all([
        this.teamsStore.load(forceRefresh),
        this.seasonsStore.load(forceRefresh),
        this.matchdaysStore.load(forceRefresh),
      ]);

      const activeSeasonId = this.activeSeasonId();
      if (this._loaded && !forceRefresh && this._loadedSeasonId === activeSeasonId) {
        return;
      }

      if (!activeSeasonId) {
        this.seasonScores.set([]);
        this.matches.set([]);
        this._loaded = true;
        this._loadedSeasonId = null;
        this.hasContent.set(true);
        return;
      }

      this.seasonScores.set(await this.loadSeasonTeamScoresUseCase.execute(activeSeasonId));

      const finishedIds = this.matchdaysStore
        .matchdays()
        .filter((md) => md.status === 'finished' && md.seasonId === activeSeasonId)
        .map((md) => md.id);

      const chunks = await Promise.all(
        finishedIds.map((id) => this.loadMatchesUseCase.byMatchday(id)),
      );
      this.matches.set(chunks.flat());

      this._loaded = true;
      this._loadedSeasonId = activeSeasonId;
      this.hasContent.set(true);
    } catch {
      this.errorMessage.set('No se pudo cargar la clasificación.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
