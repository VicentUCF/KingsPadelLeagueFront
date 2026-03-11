import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';

import { type TeamShowcaseViewModel } from '@features/league-home/ui/models/league-team-showcase.viewmodel';

@Component({
  selector: 'app-team-selector',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-selector',
  },
  imports: [NgOptimizedImage],
  templateUrl: './team-selector.component.html',
  styleUrl: './team-selector.component.scss',
})
export class TeamSelectorComponent {
  readonly teams = input.required<readonly TeamShowcaseViewModel[]>();
  readonly selectedTeamSlug = input<string | null>(null);
  readonly teamSelected = output<string>();

  protected selectTeam(teamSlug: string): void {
    this.teamSelected.emit(teamSlug);
  }

  protected isSelected(teamSlug: string): boolean {
    return this.selectedTeamSlug() === teamSlug;
  }
}
