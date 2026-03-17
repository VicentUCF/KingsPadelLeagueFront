import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { LucideAngularModule, User } from 'lucide-angular';

import { type PlayerProfileViewModel } from '../../models/player-profile.viewmodel';

@Component({
  selector: 'app-player-profile-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-profile-card',
  },
  imports: [LucideAngularModule, NgOptimizedImage],
  templateUrl: './player-profile-card.component.html',
  styleUrl: './player-profile-card.component.scss',
})
export class PlayerProfileCardComponent {
  readonly player = input.required<PlayerProfileViewModel>();
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
