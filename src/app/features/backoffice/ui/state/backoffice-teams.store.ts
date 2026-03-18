import { computed, inject, Injectable, signal } from '@angular/core';

import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import {
  toBackofficeTeamCardViewModel,
  type BackofficeTeamCardViewModel,
} from '../models/backoffice-teams.viewmodel';
import { LOAD_BACKOFFICE_TEAMS_USE_CASE } from '../providers/backoffice.providers';

@Injectable()
export class BackofficeTeamsStore {
  private readonly loadTeamsUseCase = inject(LOAD_BACKOFFICE_TEAMS_USE_CASE);

  readonly teams = signal<readonly BackofficeTeam[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = signal(false);

  private _loaded = false;

  readonly cards = computed<readonly BackofficeTeamCardViewModel[]>(() =>
    this.teams().map((team) => toBackofficeTeamCardViewModel(team, 0, '—')),
  );

  buildCards(players: readonly BackofficePlayer[]): readonly BackofficeTeamCardViewModel[] {
    return this.teams().map((team) => {
      const teamPlayers = players.filter((p) => p.teamId === team.id);
      const president = teamPlayers.find((p) => p.isPresident);
      const presidentName = president
        ? [president.firstName, president.lastName].filter(Boolean).join(' ')
        : '—';
      return toBackofficeTeamCardViewModel(team, teamPlayers.length, presidentName);
    });
  }

  async load(forceRefresh = false): Promise<void> {
    if (this._loaded && !forceRefresh) return;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.teams.set(await this.loadTeamsUseCase.execute());
      this._loaded = true;
      this.hasContent.set(true);
    } catch {
      this.errorMessage.set('No hemos podido cargar los equipos.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
