import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type UpcomingMatchCardViewModel } from '@features/matches/ui/models/upcoming-match-card.viewmodel';

@Component({
  selector: 'app-upcoming-match-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'match-card c-surface-card',
  },
  imports: [DatePipe],
  templateUrl: './upcoming-match-card.component.html',
  styleUrl: './upcoming-match-card.component.scss',
})
export class UpcomingMatchCardComponent {
  readonly match = input.required<UpcomingMatchCardViewModel>();
}
