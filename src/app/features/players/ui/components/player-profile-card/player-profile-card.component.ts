import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

  protected readonly userIcon = User;
}
