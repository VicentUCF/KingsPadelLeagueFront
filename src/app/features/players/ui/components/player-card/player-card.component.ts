import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
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

  protected readonly userIcon = User;
}
