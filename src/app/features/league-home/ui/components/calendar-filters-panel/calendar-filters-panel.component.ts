import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  type CalendarStatusFilter,
  type CalendarStatusFilterOptionViewModel,
  type CalendarTeamFilter,
  type CalendarTeamFilterOptionViewModel,
} from '@features/league-home/ui/models/league-calendar.viewmodel';

@Component({
  selector: 'app-calendar-filters-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'calendar-filters-panel-host',
  },
  templateUrl: './calendar-filters-panel.component.html',
  styleUrl: './calendar-filters-panel.component.scss',
})
export class CalendarFiltersPanelComponent {
  readonly statusFilters = input.required<readonly CalendarStatusFilterOptionViewModel[]>();
  readonly teamFilters = input.required<readonly CalendarTeamFilterOptionViewModel[]>();
  readonly filteredResultsLabel = input.required<string>();
  readonly hasActiveFilters = input.required<boolean>();

  readonly statusFilterSelected = output<CalendarStatusFilter>();
  readonly teamFilterSelected = output<CalendarTeamFilter>();
  readonly filtersCleared = output<void>();

  protected selectStatusFilter(statusFilter: CalendarStatusFilter): void {
    this.statusFilterSelected.emit(statusFilter);
  }

  protected selectTeamFilter(teamFilter: CalendarTeamFilter): void {
    this.teamFilterSelected.emit(teamFilter);
  }

  protected clearFilters(): void {
    this.filtersCleared.emit();
  }
}
