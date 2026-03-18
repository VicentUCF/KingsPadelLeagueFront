import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';

import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { SeasonCardComponent } from '../../components/season-card/season-card.component';
import { toBackofficeSeasonCardViewModel } from '../../models/backoffice-seasons.viewmodel';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-backoffice-seasons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-seasons-page' },
  imports: [LoadFeedbackComponent, LoadingStateComponent, SeasonCardComponent],
  templateUrl: './backoffice-seasons-page.component.html',
  styleUrl: './backoffice-seasons-page.component.scss',
})
export class BackofficeSeasonsPageComponent implements OnInit {
  protected readonly seasonsStore = inject(BackofficeSeasonsStore);
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  protected readonly isAdmin = computed(() => this.sessionStore.currentRole() === 'ADMIN');
  protected readonly isLoading = computed(
    () => this.seasonsStore.isLoading() || this.matchdaysStore.isLoading(),
  );
  protected readonly hasContent = computed(
    () => this.seasonsStore.hasContent() && this.matchdaysStore.hasContent(),
  );
  protected readonly errorMessage = computed(
    () => this.seasonsStore.errorMessage() ?? this.matchdaysStore.errorMessage(),
  );

  protected readonly seasonCards = computed(() =>
    this.seasonsStore.seasons().map((season) => {
      const matchdayCount = this.matchdaysStore
        .matchdays()
        .filter((m) => m.seasonId === season.id).length;
      const isActive = this.matchdaysStore
        .matchdays()
        .some((m) => m.seasonId === season.id && m.status === 'in_progress');
      return toBackofficeSeasonCardViewModel(season, matchdayCount, isActive);
    }),
  );

  ngOnInit(): void {
    void this.seasonsStore.load();
    void this.matchdaysStore.load();
  }

  protected reloadData(): void {
    void Promise.all([this.seasonsStore.load(true), this.matchdaysStore.load(true)]);
  }
}
