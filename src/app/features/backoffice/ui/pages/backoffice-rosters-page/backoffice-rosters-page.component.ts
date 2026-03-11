import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { RosterListCardComponent } from '../../components/roster-list-card/roster-list-card.component';
import { BackofficeRostersStore } from '../../state/backoffice-rosters.store';

@Component({
  selector: 'app-backoffice-rosters-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-rosters-page',
  },
  imports: [EmptyStateComponent, RosterListCardComponent],
  providers: [BackofficeRostersStore],
  templateUrl: './backoffice-rosters-page.component.html',
  styleUrl: './backoffice-rosters-page.component.scss',
})
export class BackofficeRostersPageComponent implements OnInit {
  protected readonly store = inject(BackofficeRostersStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
