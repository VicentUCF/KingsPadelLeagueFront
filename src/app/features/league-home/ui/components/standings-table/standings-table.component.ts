import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type StandingsRowViewModel } from '@features/league-home/ui/models/league-home.viewmodel';

import { RankIndicatorComponent } from '../rank-indicator/rank-indicator.component';
import { TeamBadgeComponent } from '../team-badge/team-badge.component';

@Component({
  selector: 'app-standings-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'standings-table c-surface-card',
  },
  imports: [RankIndicatorComponent, TeamBadgeComponent],
  templateUrl: './standings-table.component.html',
  styleUrl: './standings-table.component.scss',
})
export class StandingsTableComponent {
  readonly caption = input('Clasificación actual de KingsPadelLeague');
  readonly rows = input.required<readonly StandingsRowViewModel[]>();
}
