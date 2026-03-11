import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { type BackofficeTeamFormValue } from '../../models/backoffice-crud.model';
import { TeamFormDialogComponent } from '../../components/team-form-dialog/team-form-dialog.component';
import { TeamListCardComponent } from '../../components/team-list-card/team-list-card.component';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';

@Component({
  selector: 'app-backoffice-teams-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-teams-page',
  },
  imports: [EmptyStateComponent, TeamFormDialogComponent, TeamListCardComponent],
  providers: [BackofficeTeamsStore],
  templateUrl: './backoffice-teams-page.component.html',
  styleUrl: './backoffice-teams-page.component.scss',
})
export class BackofficeTeamsPageComponent implements OnInit {
  protected readonly store = inject(BackofficeTeamsStore);

  ngOnInit(): void {
    void this.store.load();
  }

  protected openCreateDialog(): void {
    this.store.openCreateDialog();
  }

  protected closeCreateDialog(): void {
    this.store.closeCreateDialog();
  }

  protected submitCreate(formValue: BackofficeTeamFormValue): void {
    void this.store.createTeam(formValue);
  }
}
