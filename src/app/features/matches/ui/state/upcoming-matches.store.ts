import { computed, inject, Injectable, signal } from '@angular/core';

import { toUpcomingMatchCardViewModel } from '@features/matches/ui/models/upcoming-match-card.viewmodel';
import { LOAD_UPCOMING_MATCHES_USE_CASE } from '@features/matches/ui/providers/upcoming-matches.providers';

@Injectable()
export class UpcomingMatchesStore {
  private readonly loadUpcomingMatchesUseCase = inject(LOAD_UPCOMING_MATCHES_USE_CASE);

  readonly matches = signal<readonly ReturnType<typeof toUpcomingMatchCardViewModel>[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly hasMatches = computed(() => this.matches().length > 0);
  readonly readyMatchesCount = computed(() => {
    return this.matches().filter((match) => match.isReady).length;
  });
  readonly pendingMatchesCount = computed(() => {
    return this.matches().length - this.readyMatchesCount();
  });

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    try {
      const matches = await this.loadUpcomingMatchesUseCase.execute();

      this.matches.set(matches.map(toUpcomingMatchCardViewModel));
    } catch {
      this.errorMessage.set('Unable to load the matches board right now.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
