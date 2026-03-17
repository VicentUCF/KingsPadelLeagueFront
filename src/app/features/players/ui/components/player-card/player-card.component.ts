import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, User } from 'lucide-angular';

import { type PlayerCardViewModel } from '../../models/player-directory.viewmodel';

@Component({
  selector: 'app-player-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-card',
  },
  imports: [LucideAngularModule, NgOptimizedImage, RouterLink],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {
  readonly player = input.required<PlayerCardViewModel>();
  private readonly failedAvatarPath = signal<string | null>(null);

  protected readonly userIcon = User;
  protected readonly avatarSrc = computed(() => {
    const currentAvatarPath = this.player().avatarPath;

    if (!currentAvatarPath || this.failedAvatarPath() === currentAvatarPath) {
      return null;
    }

    return currentAvatarPath;
  });

  protected useFallbackAvatar(): void {
    this.failedAvatarPath.set(this.player().avatarPath);
  }
}
