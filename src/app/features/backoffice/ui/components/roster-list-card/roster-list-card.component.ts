import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { type BackofficeRosterCardViewModel } from '../../models/backoffice-rosters.viewmodel';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';

@Component({
  selector: 'app-roster-list-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'roster-list-card c-surface-card',
  },
  imports: [RouterLink, StatusBadgeComponent],
  templateUrl: './roster-list-card.component.html',
  styleUrl: './roster-list-card.component.scss',
})
export class RosterListCardComponent {
  readonly roster = input.required<BackofficeRosterCardViewModel>();
}
