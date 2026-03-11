import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type BackofficePlayerCardViewModel } from '../../models/backoffice-players.viewmodel';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-player-directory-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-directory-card c-surface-card',
  },
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './player-directory-card.component.html',
  styleUrl: './player-directory-card.component.scss',
})
export class PlayerDirectoryCardComponent {
  readonly player = input.required<BackofficePlayerCardViewModel>();
}
