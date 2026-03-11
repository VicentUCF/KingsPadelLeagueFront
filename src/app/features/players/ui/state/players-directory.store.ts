import { computed, inject, Injectable, signal } from '@angular/core';

import {
  toPlayerDirectorySectionsViewModel,
  toRankedPlayersViewModel,
  type PlayerCardViewModel,
} from '@features/players/ui/models/player-directory.viewmodel';
import { LOAD_PLAYERS_USE_CASE } from '@features/players/ui/providers/players.providers';

@Injectable()
export class PlayersDirectoryStore {
  private readonly loadPlayersUseCase = inject(LOAD_PLAYERS_USE_CASE);

  readonly rankedPlayers = signal<readonly PlayerCardViewModel[]>([]);
  readonly sections = signal<ReturnType<typeof toPlayerDirectorySectionsViewModel>>([]);
  readonly searchQuery = signal('');
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasPlayers = computed(() => this.rankedPlayers().length > 0);
  readonly hasSections = computed(() => this.sections().length > 0);

  readonly filteredPlayers = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) return this.rankedPlayers();
    return this.rankedPlayers().filter(
      (p) =>
        p.displayName.toLowerCase().includes(query) || p.teamName.toLowerCase().includes(query),
    );
  });

  readonly totalTeamsCount = computed(() => this.sections().length);
  readonly totalPlayersCount = computed(() => this.rankedPlayers().length);
  readonly totalPlayedMatchesCount = computed(() => {
    return this.rankedPlayers().reduce((total, p) => total + p.playedMatchesCount, 0);
  });

  setSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const players = await this.loadPlayersUseCase.execute();

      this.rankedPlayers.set(toRankedPlayersViewModel(players));
      this.sections.set(toPlayerDirectorySectionsViewModel(players));
    } catch {
      this.errorMessage.set('No hemos podido cargar el directorio de jugadores.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
