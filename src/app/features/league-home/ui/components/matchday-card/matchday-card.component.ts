import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';

import { TeamBadgeComponent } from '@features/league-home/ui/components/team-badge/team-badge.component';
import { type MatchdayCardViewModel } from '@features/league-home/ui/models/league-matchdays.viewmodel';

@Component({
  selector: 'app-matchday-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'matchday-card-host',
  },
  imports: [LucideAngularModule, RouterLink, TeamBadgeComponent],
  templateUrl: './matchday-card.component.html',
  styleUrl: './matchday-card.component.scss',
})
export class MatchdayCardComponent {
  readonly matchday = input.required<MatchdayCardViewModel>();

  protected readonly arrowRightIcon = ArrowRight;
}
