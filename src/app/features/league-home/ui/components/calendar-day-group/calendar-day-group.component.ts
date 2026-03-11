import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type CalendarDayGroupViewModel } from '@features/league-home/ui/models/league-calendar.viewmodel';

import { CalendarEncounterCardComponent } from '../calendar-encounter-card/calendar-encounter-card.component';

@Component({
  selector: 'app-calendar-day-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'calendar-day-group-host',
  },
  imports: [CalendarEncounterCardComponent],
  templateUrl: './calendar-day-group.component.html',
  styleUrl: './calendar-day-group.component.scss',
})
export class CalendarDayGroupComponent {
  readonly dayGroup = input.required<CalendarDayGroupViewModel>();
}
