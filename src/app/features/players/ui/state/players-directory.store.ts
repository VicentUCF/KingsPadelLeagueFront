import { computed, inject, Injectable, signal } from '@angular/core';

import {
  toPlayerDirectorySectionsViewModel,
  toRankedPlayersViewModel,
  type PlayerCardViewModel,
} from '@features/players/ui/models/player-directory.viewmodel';
import {
  ALL_PLAYER_DIRECTORY_SIDES,
  ALL_PLAYER_DIRECTORY_TEAMS,
  PLAYER_DIRECTORY_SIDE_OPTIONS,
  buildPlayerTeamFilterOptions,
  coercePlayerDirectorySideFilter,
  filterPlayerDirectoryCards,
  getPlayerDirectorySearchPlaceholder,
  type PlayerDirectoryFilters,
} from '@features/players/ui/models/player-directory-filters';
import { LOAD_PLAYERS_USE_CASE } from '@features/players/ui/providers/players.providers';

@Injectable()
export class PlayersDirectoryStore {
  private readonly loadPlayersUseCase = inject(LOAD_PLAYERS_USE_CASE);

  readonly rankedPlayers = signal<readonly PlayerCardViewModel[]>([]);
  readonly sections = signal<ReturnType<typeof toPlayerDirectorySectionsViewModel>>([]);
  readonly filters = signal<PlayerDirectoryFilters>({
    query: '',
    side: ALL_PLAYER_DIRECTORY_SIDES,
    teamName: ALL_PLAYER_DIRECTORY_TEAMS,
  });
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly sideFilterOptions = PLAYER_DIRECTORY_SIDE_OPTIONS;

  readonly hasPlayers = computed(() => this.rankedPlayers().length > 0);
  readonly hasSections = computed(() => this.sections().length > 0);
  readonly searchQuery = computed(() => this.filters().query);
  readonly selectedTeamName = computed(() => this.filters().teamName);
  readonly selectedSide = computed(() => this.filters().side);
  readonly searchPlaceholder = computed(() => getPlayerDirectorySearchPlaceholder());
  readonly teamFilterOptions = computed(() => buildPlayerTeamFilterOptions(this.rankedPlayers()));
  readonly hasActiveFilters = computed(() => {
    const filters = this.filters();

    return (
      filters.query.trim().length > 0 ||
      filters.teamName !== ALL_PLAYER_DIRECTORY_TEAMS ||
      filters.side !== ALL_PLAYER_DIRECTORY_SIDES
    );
  });

  readonly filteredPlayers = computed(() => {
    return filterPlayerDirectoryCards(this.rankedPlayers(), this.filters());
  });

  readonly totalTeamsCount = computed(() => this.sections().length);
  readonly totalPlayersCount = computed(() => this.rankedPlayers().length);
  readonly totalPlayedMatchesCount = computed(() => {
    return this.rankedPlayers().reduce((total, p) => total + p.playedMatchesCount, 0);
  });

  setSearchQuery(query: string): void {
    this.filters.update((filters) => ({ ...filters, query }));
  }

  setSelectedTeamName(teamName: string): void {
    this.filters.update((filters) => ({ ...filters, teamName }));
  }

  setSelectedSide(side: string): void {
    this.filters.update((filters) => ({
      ...filters,
      side: coercePlayerDirectorySideFilter(side),
    }));
  }

  clearFilters(): void {
    this.filters.set({
      query: '',
      side: ALL_PLAYER_DIRECTORY_SIDES,
      teamName: ALL_PLAYER_DIRECTORY_TEAMS,
    });
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
