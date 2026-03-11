import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';

import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { SeasonFormDialogComponent } from '../../components/season-form-dialog/season-form-dialog.component';
import { type BackofficeSeasonFormValue } from '../../models/backoffice-crud.model';
import { BackofficeSeasonDetailStore } from '../../state/backoffice-season-detail.store';
import { type BackofficeSeasonStatusAction } from '../../state/backoffice-season-detail.store';

@Component({
  selector: 'app-backoffice-season-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-season-detail-page',
  },
  imports: [
    ConfirmActionDialogComponent,
    EmptyStateComponent,
    RouterLink,
    SeasonFormDialogComponent,
    StatusBadgeComponent,
  ],
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

  protected openEditDialog(): void {
    this.store.openEditDialog();
  }

  protected closeEditDialog(): void {
    this.store.closeEditDialog();
  }

  protected submitEdit(formValue: BackofficeSeasonFormValue): void {
    void this.store.updateSeason(formValue);
  }

  protected openStatusDialog(action: BackofficeSeasonStatusAction): void {
    this.store.openStatusDialog(action);
  }

  protected closeStatusDialog(): void {
    this.store.closeStatusDialog();
  }

  protected confirmStatusChange(): void {
    void this.store.confirmStatusChange();
  }
}
