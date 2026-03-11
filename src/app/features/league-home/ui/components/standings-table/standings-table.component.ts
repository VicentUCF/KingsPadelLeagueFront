import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type StandingsRowViewModel } from '@features/league-home/ui/models/league-home.viewmodel';

@Component({
  selector: 'app-standings-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'standings-table c-surface-card',
  },
  templateUrl: './standings-table.component.html',
  styleUrl: './standings-table.component.scss',
})
export class StandingsTableComponent {
  readonly rows = input.required<readonly StandingsRowViewModel[]>();
}
