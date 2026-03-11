import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';

import { type CalendarEncounterCardViewModel } from '@features/league-home/ui/models/league-calendar.viewmodel';

@Component({
  selector: 'app-calendar-encounter-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'calendar-encounter-card-host',
  },
  imports: [LucideAngularModule, NgOptimizedImage, RouterLink],
  templateUrl: './calendar-encounter-card.component.html',
  styleUrl: './calendar-encounter-card.component.scss',
})
export class CalendarEncounterCardComponent {
  readonly encounter = input.required<CalendarEncounterCardViewModel>();

  protected readonly arrowRightIcon = ArrowRight;
}
