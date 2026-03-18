import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type LeagueStandingsTableRowViewModel } from '@features/league-home/ui/models/league-standings.viewmodel';

import { RankIndicatorComponent } from '../rank-indicator/rank-indicator.component';
import { TeamBadgeComponent } from '../team-badge/team-badge.component';

@Component({
  selector: 'app-standings-detail-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'standings-detail-table c-surface-card',
  },
  imports: [RankIndicatorComponent, TeamBadgeComponent],
  templateUrl: './standings-detail-table.component.html',
  styleUrl: './standings-detail-table.component.scss',
})
export class StandingsDetailTableComponent {
  readonly caption = input('Clasificación oficial de KingsPadelLeague');
  readonly rows = input.required<readonly LeagueStandingsTableRowViewModel[]>();
}
