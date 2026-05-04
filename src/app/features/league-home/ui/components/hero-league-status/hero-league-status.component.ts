import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Trophy } from 'lucide-angular';

import { applicationMetadata } from '@core/config/application-metadata';

@Component({
  selector: 'app-hero-league-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'hero-league-status',
  },
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './hero-league-status.component.html',
  styleUrl: './hero-league-status.component.scss',
})
export class HeroLeagueStatusComponent {
  readonly leagueName = input.required<string>();
  readonly leagueTagline = input.required<string>();
  readonly seasonLabel = input.required<string>();
  readonly phaseLabel = input.required<string>();
  readonly currentMatchdayLabel = input.required<string>();

  protected readonly brandLogoPath = applicationMetadata.logoPath;
  protected readonly trophyIcon = Trophy;
  protected readonly calendarDaysIcon = CalendarDays;
}
