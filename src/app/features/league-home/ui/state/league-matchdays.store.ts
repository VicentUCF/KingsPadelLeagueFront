import { computed, inject, Injectable, signal } from '@angular/core';

import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { LOAD_LEAGUE_MATCHDAYS_USE_CASE } from '@features/league-home/ui/providers/league-home.providers';

@Injectable()
export class LeagueMatchdaysStore {
  private readonly loadLeagueMatchdaysUseCase = inject(LOAD_LEAGUE_MATCHDAYS_USE_CASE);

  readonly matchdays = signal<readonly LeagueMatchday[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasMatchdays = computed(() => this.matchdays().length > 0);

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      this.matchdays.set(await this.loadLeagueMatchdaysUseCase.execute());
    } catch {
      this.errorMessage.set('No hemos podido cargar el panel de jornadas.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
