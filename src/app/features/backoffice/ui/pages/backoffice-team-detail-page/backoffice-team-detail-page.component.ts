import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { type BackofficeTeamTabId } from '../../../domain/entities/backoffice-team.entity';
import {
  BACKOFFICE_TEAM_TABS,
  type BackofficeTeamTabViewModel,
} from '../../models/backoffice-teams.viewmodel';
import { BackofficeTeamDetailStore } from '../../state/backoffice-team-detail.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';

@Component({
  selector: 'app-backoffice-team-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-team-detail-page',
  },
  imports: [EmptyStateComponent, RouterLink, StatusBadgeComponent],
  providers: [BackofficeTeamDetailStore],
  templateUrl: './backoffice-team-detail-page.component.html',
  styleUrl: './backoffice-team-detail-page.component.scss',
})
export class BackofficeTeamDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly store = inject(BackofficeTeamDetailStore);
  protected readonly tabs = BACKOFFICE_TEAM_TABS;

  ngOnInit(): void {
    const routeSubscription = this.route.paramMap.subscribe((paramMap) => {
      void this.store.load(paramMap.get('teamId'));
    });

    this.destroyRef.onDestroy(() => {
      routeSubscription.unsubscribe();
    });
  }

  protected selectTab(tabId: BackofficeTeamTabId): void {
    this.store.setSelectedTab(tabId);
  }

  protected isSelectedTab(tabId: BackofficeTeamTabViewModel['id']): boolean {
    return this.store.selectedTab() === tabId;
  }
}
