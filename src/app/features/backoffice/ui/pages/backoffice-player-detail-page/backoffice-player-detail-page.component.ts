import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { BackofficePlayerDetailStore } from '../../state/backoffice-player-detail.store';

@Component({
  selector: 'app-backoffice-player-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-player-detail-page',
  },
  imports: [EmptyStateComponent, RouterLink, StatusBadgeComponent],
  providers: [BackofficePlayerDetailStore],
  templateUrl: './backoffice-player-detail-page.component.html',
  styleUrl: './backoffice-player-detail-page.component.scss',
})
export class BackofficePlayerDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly store = inject(BackofficePlayerDetailStore);

  ngOnInit(): void {
    const routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      void this.store.load(paramMap.get('playerId'));
    });

    this.destroyRef.onDestroy(() => {
      routeSubscription.unsubscribe();
    });
  }
}
