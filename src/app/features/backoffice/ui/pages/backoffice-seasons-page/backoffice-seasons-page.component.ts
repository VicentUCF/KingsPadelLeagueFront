import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { SeasonCardComponent } from '../../components/season-card/season-card.component';
import { type BackofficeSeasonFormValue } from '../../models/backoffice-crud.model';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { SeasonFormDialogComponent } from '../../components/season-form-dialog/season-form-dialog.component';

@Component({
  selector: 'app-backoffice-seasons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-seasons-page',
  },
  imports: [EmptyStateComponent, SeasonCardComponent, SeasonFormDialogComponent],
  providers: [BackofficeSeasonsStore],
  templateUrl: './backoffice-seasons-page.component.html',
  styleUrl: './backoffice-seasons-page.component.scss',
})
export class BackofficeSeasonsPageComponent implements OnInit {
  protected readonly store = inject(BackofficeSeasonsStore);

  ngOnInit(): void {
    void this.store.load();
  }

  protected openCreateDialog(): void {
    this.store.openCreateDialog();
  }

  protected closeCreateDialog(): void {
    this.store.closeCreateDialog();
  }

  protected submitCreate(formValue: BackofficeSeasonFormValue): void {
    void this.store.createSeason(formValue);
  }
}
