import { ChangeDetectionStrategy, Component, DestroyRef, inject, type OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ConfirmActionDialogComponent } from '@shared/ui/confirm-action-dialog/confirm-action-dialog.component';

import { PlayerFormDialogComponent } from '../../components/player-form-dialog/player-form-dialog.component';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { type BackofficePlayerFormValue } from '../../models/backoffice-crud.model';
import { BackofficePlayerDetailStore } from '../../state/backoffice-player-detail.store';
import { type BackofficePlayerStatusAction } from '../../state/backoffice-player-detail.store';

@Component({
  selector: 'app-backoffice-player-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-player-detail-page',
  },
  imports: [
    ConfirmActionDialogComponent,
    EmptyStateComponent,
    PlayerFormDialogComponent,
    RouterLink,
    StatusBadgeComponent,
  ],
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

  protected openEditDialog(): void {
    this.store.openEditDialog();
  }

  protected closeEditDialog(): void {
    this.store.closeEditDialog();
  }

  protected submitEdit(formValue: BackofficePlayerFormValue): void {
    void this.store.updatePlayer(formValue);
  }

  protected openStatusDialog(action: BackofficePlayerStatusAction): void {
    this.store.openStatusDialog(action);
  }

  protected closeStatusDialog(): void {
    this.store.closeStatusDialog();
  }

  protected confirmStatusChange(): void {
    void this.store.confirmStatusChange();
  }
}
