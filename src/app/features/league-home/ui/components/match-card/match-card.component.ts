import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Clock3, LucideAngularModule, Swords } from 'lucide-angular';

@Component({
  selector: 'app-match-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'match-card c-surface-card',
  },
  imports: [LucideAngularModule],
  templateUrl: './match-card.component.html',
  styleUrl: './match-card.component.scss',
})
export class MatchCardComponent {
  readonly homeTeamName = input.required<string>();
  readonly awayTeamName = input.required<string>();
  readonly scheduledAtLabel = input.required<string>();

  protected readonly swordsIcon = Swords;
  protected readonly clockIcon = Clock3;
}
