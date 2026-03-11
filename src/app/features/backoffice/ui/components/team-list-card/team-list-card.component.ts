import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type BackofficeTeamCardViewModel } from '../../models/backoffice-teams.viewmodel';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-team-list-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-list-card c-surface-card',
  },
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './team-list-card.component.html',
  styleUrl: './team-list-card.component.scss',
})
export class TeamListCardComponent {
  readonly team = input.required<BackofficeTeamCardViewModel>();
}
