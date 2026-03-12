import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';

import { type StandingsRowViewModel } from '@features/league-home/ui/models/league-home.viewmodel';

import { RankIndicatorComponent } from '../rank-indicator/rank-indicator.component';
import { TeamBadgeComponent } from '../team-badge/team-badge.component';

const TABLE_LAYOUT_MEDIA_QUERY = '(min-width: 48rem)';

@Component({
  selector: 'app-standings-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'standings-table c-surface-card',
  },
  imports: [RankIndicatorComponent, TeamBadgeComponent],
  templateUrl: './standings-table.component.html',
  styleUrl: './standings-table.component.scss',
})
export class StandingsTableComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly caption = input('Clasificación actual de KingsPadelLeague');
  readonly rows = input.required<readonly StandingsRowViewModel[]>();
  protected readonly usesTableLayout = signal(this.matchesTableLayout());

  constructor() {
    this.bindTableLayoutBreakpoint();
  }

  private bindTableLayoutBreakpoint(): void {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return;
    }

    const mediaQueryList = window.matchMedia(TABLE_LAYOUT_MEDIA_QUERY);
    const syncTableLayout = () => this.usesTableLayout.set(mediaQueryList.matches);

    syncTableLayout();

    if (typeof mediaQueryList.addEventListener === 'function') {
      mediaQueryList.addEventListener('change', syncTableLayout);
      this.destroyRef.onDestroy(() =>
        mediaQueryList.removeEventListener('change', syncTableLayout),
      );

      return;
    }

    mediaQueryList.addListener(syncTableLayout);
    this.destroyRef.onDestroy(() => mediaQueryList.removeListener(syncTableLayout));
  }

  private matchesTableLayout(): boolean {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return true;
    }

    return window.matchMedia(TABLE_LAYOUT_MEDIA_QUERY).matches;
  }
}
