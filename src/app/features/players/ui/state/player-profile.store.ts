import { computed, inject, Injectable, signal } from '@angular/core';

import {
  toPlayerProfileViewModel,
  type PlayerProfileViewModel,
} from '@features/players/ui/models/player-profile.viewmodel';
import { LOAD_PLAYER_PROFILE_USE_CASE } from '@features/players/ui/providers/players.providers';

@Injectable()
export class PlayerProfileStore {
  private readonly loadPlayerProfileUseCase = inject(LOAD_PLAYER_PROFILE_USE_CASE);

  readonly player = signal<PlayerProfileViewModel | null>(null);
  readonly currentSlug = signal<string | null>(null);
  readonly resolvedSlug = signal<string | null>(null);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly hasContent = computed(
    () => this.currentSlug() !== null && this.currentSlug() === this.resolvedSlug(),
  );

  readonly isNotFound = computed(() => {
    return (
      !this.isLoading() &&
      this.hasContent() &&
      this.player() === null &&
      this.errorMessage() === null
    );
  });

  async load(slug: string | null, forceRefresh = false): Promise<void> {
    const previousSlug = this.currentSlug();
    const isSameSlug = previousSlug === slug;

    this.currentSlug.set(slug);
    this.errorMessage.set(null);

    if (!slug) {
      this.player.set(null);
      this.resolvedSlug.set(null);
      return;
    }

    if (!isSameSlug) {
      this.player.set(null);
      this.resolvedSlug.set(null);
    }

    this.isLoading.set(true);

    try {
      const player = await this.loadPlayerProfileUseCase.execute(slug, forceRefresh);

      this.player.set(player ? toPlayerProfileViewModel(player) : null);
      this.resolvedSlug.set(slug);
    } catch {
      this.errorMessage.set('No hemos podido cargar el perfil del jugador.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
