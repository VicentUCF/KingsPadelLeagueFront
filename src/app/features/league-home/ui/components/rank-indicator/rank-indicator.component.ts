import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Crown, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-rank-indicator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'rank-indicator-host',
  },
  imports: [LucideAngularModule],
  templateUrl: './rank-indicator.component.html',
  styleUrl: './rank-indicator.component.scss',
})
export class RankIndicatorComponent {
  readonly rank = input.required<number>();
  readonly isLeader = input(false);
  readonly isLast = input(false);
  readonly compact = input(false);

  protected readonly crownIcon = Crown;
}
