import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-team-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-badge-host',
  },
  imports: [NgOptimizedImage, RouterLink],
  templateUrl: './team-badge.component.html',
  styleUrl: './team-badge.component.scss',
})
export class TeamBadgeComponent {
  readonly teamName = input.required<string>();
  readonly monogram = input.required<string>();
  readonly logoPath = input<string | null>(null);
  readonly compact = input(false);
  readonly teamLink = input<string | null>(null);
  readonly interactive = input(false);
}
