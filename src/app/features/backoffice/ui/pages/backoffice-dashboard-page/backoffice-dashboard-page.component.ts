import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { BackofficeDashboardStore } from '../../state/backoffice-dashboard.store';

@Component({
  selector: 'app-backoffice-dashboard-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-dashboard-page',
  },
  imports: [EmptyStateComponent, RouterLink, StatusBadgeComponent],
  providers: [BackofficeDashboardStore],
  templateUrl: './backoffice-dashboard-page.component.html',
  styleUrl: './backoffice-dashboard-page.component.scss',
})
export class BackofficeDashboardPageComponent implements OnInit {
  protected readonly store = inject(BackofficeDashboardStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
