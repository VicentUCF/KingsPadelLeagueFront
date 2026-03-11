import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';

import { type BackofficeTeamTabId } from '../../../domain/entities/backoffice-team.entity';
import {
  BACKOFFICE_TEAM_TABS,
  type BackofficeTeamTabViewModel,
} from '../../models/backoffice-teams.viewmodel';
import { type BackofficeTeamFormValue } from '../../models/backoffice-crud.model';
import { BackofficeTeamDetailStore } from '../../state/backoffice-team-detail.store';
import { type BackofficeTeamStatusAction } from '../../state/backoffice-team-detail.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { TeamFormDialogComponent } from '../../components/team-form-dialog/team-form-dialog.component';

@Component({
  selector: 'app-backoffice-team-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-team-detail-page',
  },
  imports: [
    ConfirmActionDialogComponent,
    EmptyStateComponent,
    RouterLink,
    StatusBadgeComponent,
    TeamFormDialogComponent,
  ],
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

  protected openEditDialog(): void {
    this.store.openEditDialog();
  }

  protected closeEditDialog(): void {
    this.store.closeEditDialog();
  }

  protected submitEdit(formValue: BackofficeTeamFormValue): void {
    void this.store.updateTeam(formValue);
  }

  protected openStatusDialog(action: BackofficeTeamStatusAction): void {
    this.store.openStatusDialog(action);
  }

  protected closeStatusDialog(): void {
    this.store.closeStatusDialog();
  }

  protected confirmStatusChange(): void {
    void this.store.confirmStatusChange();
  }
}
