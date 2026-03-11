import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type PlayerCardViewModel } from '../../models/player-directory.viewmodel';

@Component({
  selector: 'app-player-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-card',
  },
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './player-card.component.html',
  styleUrl: './player-card.component.scss',
})
export class PlayerCardComponent {
  readonly player = input.required<PlayerCardViewModel>();
}
