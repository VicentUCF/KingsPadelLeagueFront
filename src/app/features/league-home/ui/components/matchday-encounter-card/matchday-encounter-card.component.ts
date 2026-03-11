import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Swords } from 'lucide-angular';

import { TeamBadgeComponent } from '@features/league-home/ui/components/team-badge/team-badge.component';
import { type MatchdayEncounterDetailViewModel } from '@features/league-home/ui/models/league-matchday-detail.viewmodel';

@Component({
  selector: 'app-matchday-encounter-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'matchday-encounter-card-host',
  },
  imports: [LucideAngularModule, TeamBadgeComponent],
  templateUrl: './matchday-encounter-card.component.html',
  styleUrl: './matchday-encounter-card.component.scss',
})
export class MatchdayEncounterCardComponent {
  readonly encounter = input.required<MatchdayEncounterDetailViewModel>();

  protected readonly swordsIcon = Swords;
}
