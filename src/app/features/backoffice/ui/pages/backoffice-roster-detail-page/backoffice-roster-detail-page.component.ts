import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { NavigationHistoryService } from '@core/services/navigation-history.service';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { type BackofficeRosterTabId } from '../../../domain/entities/backoffice-roster.entity';
import {
  BACKOFFICE_ROSTER_TABS,
  type BackofficeRosterTabViewModel,
} from '../../models/backoffice-rosters.viewmodel';
import { BackofficeRosterDetailStore } from '../../state/backoffice-roster-detail.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

@Component({
  selector: 'app-backoffice-roster-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-roster-detail-page',
  },
  imports: [EmptyStateComponent, StatusBadgeComponent],
  providers: [BackofficeRosterDetailStore],
  templateUrl: './backoffice-roster-detail-page.component.html',
  styleUrl: './backoffice-roster-detail-page.component.scss',
})
export class BackofficeRosterDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly navHistory = inject(NavigationHistoryService);

  protected readonly store = inject(BackofficeRosterDetailStore);

  protected goBack(): void {
    this.navHistory.goBack('/backoffice/plantillas');
  }
  protected readonly tabs = BACKOFFICE_ROSTER_TABS;

  ngOnInit(): void {
    const routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      void this.store.load(paramMap.get('rosterId'));
    });

    this.destroyRef.onDestroy(() => {
      routeSubscription.unsubscribe();
    });
  }

  protected selectTab(tabId: BackofficeRosterTabId): void {
    this.store.setSelectedTab(tabId);
  }

  protected isSelectedTab(tabId: BackofficeRosterTabViewModel['id']): boolean {
    return this.store.selectedTab() === tabId;
  }
}
