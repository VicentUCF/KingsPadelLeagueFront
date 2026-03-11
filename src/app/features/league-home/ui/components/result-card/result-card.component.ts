import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Trophy } from 'lucide-angular';

import { type ResultCardViewModel } from '@features/league-home/ui/models/league-home.viewmodel';

@Component({
  selector: 'app-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'result-card c-surface-card',
  },
  imports: [LucideAngularModule],
  templateUrl: './result-card.component.html',
  styleUrl: './result-card.component.scss',
})
export class ResultCardComponent {
  readonly result = input.required<ResultCardViewModel>();

  protected readonly trophyIcon = Trophy;
}
