import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type BackofficeSeasonCardViewModel } from '../../models/backoffice-seasons.viewmodel';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-season-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'season-card c-surface-card',
  },
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './season-card.component.html',
  styleUrl: './season-card.component.scss',
})
export class SeasonCardComponent {
  readonly season = input.required<BackofficeSeasonCardViewModel>();
}
