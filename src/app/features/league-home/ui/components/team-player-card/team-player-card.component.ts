import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { LucideAngularModule, User } from 'lucide-angular';

import { type TeamRosterPlayerViewModel } from '@features/league-home/ui/models/league-team-showcase.viewmodel';

@Component({
  selector: 'app-team-player-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-player-card',
  },
  imports: [LucideAngularModule, NgOptimizedImage],
  templateUrl: './team-player-card.component.html',
  styleUrl: './team-player-card.component.scss',
})
export class TeamPlayerCardComponent {
  readonly player = input.required<TeamRosterPlayerViewModel>();

  protected readonly userIcon = User;
}
