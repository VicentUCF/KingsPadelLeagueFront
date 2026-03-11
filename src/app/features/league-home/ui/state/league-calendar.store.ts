import { computed, inject, Injectable, signal } from '@angular/core';

import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';
import {
  LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE,
  LOAD_LEAGUE_MATCHDAYS_USE_CASE,
} from '@features/league-home/ui/providers/league-home.providers';

@Injectable()
export class LeagueCalendarStore {
  private readonly loadLeagueHomeSnapshotUseCase = inject(LOAD_LEAGUE_HOME_SNAPSHOT_USE_CASE);
  private readonly loadLeagueMatchdaysUseCase = inject(LOAD_LEAGUE_MATCHDAYS_USE_CASE);

  readonly snapshot = signal<LeagueHomeSnapshot | null>(null);
  readonly matchdays = signal<readonly LeagueMatchday[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasSnapshot = computed(() => this.snapshot() !== null);
  readonly hasMatchdays = computed(() => this.matchdays().length > 0);

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const [snapshot, matchdays] = await Promise.all([
        this.loadLeagueHomeSnapshotUseCase.execute(),
        this.loadLeagueMatchdaysUseCase.execute(),
      ]);

      this.snapshot.set(snapshot);
      this.matchdays.set(matchdays);
    } catch {
      this.errorMessage.set('No hemos podido cargar el calendario completo de la liga.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
