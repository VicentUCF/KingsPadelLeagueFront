import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { BackofficeSeasonDetailStore } from '../../state/backoffice-season-detail.store';

@Component({
  selector: 'app-backoffice-season-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-season-detail-page',
  },
  imports: [EmptyStateComponent, RouterLink, StatusBadgeComponent],
  providers: [BackofficeSeasonDetailStore],
  templateUrl: './backoffice-season-detail-page.component.html',
  styleUrl: './backoffice-season-detail-page.component.scss',
})
export class BackofficeSeasonDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly store = inject(BackofficeSeasonDetailStore);

  ngOnInit(): void {
    const routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      void this.store.load(paramMap.get('seasonId'));
    });

    this.destroyRef.onDestroy(() => {
      routeSubscription.unsubscribe();
    });
  }
}
