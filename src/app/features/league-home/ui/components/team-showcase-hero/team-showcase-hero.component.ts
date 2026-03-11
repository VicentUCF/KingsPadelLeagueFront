import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { NgOptimizedImage } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ArrowUpRight, LucideAngularModule, Sparkles, User } from 'lucide-angular';

import { type TeamShowcaseViewModel } from '@features/league-home/ui/models/league-team-showcase.viewmodel';

@Component({
  selector: 'app-team-showcase-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-showcase-hero',
  },
  imports: [LucideAngularModule, NgOptimizedImage, RouterLink],
  templateUrl: './team-showcase-hero.component.html',
  styleUrl: './team-showcase-hero.component.scss',
})
export class TeamShowcaseHeroComponent {
  readonly team = input.required<TeamShowcaseViewModel>();
  readonly mode = input<'preview' | 'page'>('preview');
  readonly actionLabel = input<string | null>(null);
  readonly actionLink = input<string | null>(null);

  protected readonly sparklesIcon = Sparkles;
  protected readonly arrowUpRightIcon = ArrowUpRight;
  protected readonly userIcon = User;
  protected readonly compactRoster = computed(() => this.team().roster.slice(0, 3));
}
