import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowUpRight, LucideAngularModule, Shield, Users } from 'lucide-angular';

import { type TeamCardViewModel } from '@features/league-home/ui/models/league-home.viewmodel';

@Component({
  selector: 'app-team-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-card',
  },
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './team-card.component.html',
  styleUrl: './team-card.component.scss',
})
export class TeamCardComponent {
  readonly team = input.required<TeamCardViewModel>();

  protected readonly shieldIcon = Shield;
  protected readonly usersIcon = Users;
  protected readonly arrowUpRightIcon = ArrowUpRight;
}
