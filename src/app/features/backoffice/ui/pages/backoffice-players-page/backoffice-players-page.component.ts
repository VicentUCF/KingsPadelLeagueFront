import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { PlayerDirectoryCardComponent } from '../../components/player-directory-card/player-directory-card.component';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';

@Component({
  selector: 'app-backoffice-players-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-players-page',
  },
  imports: [EmptyStateComponent, PlayerDirectoryCardComponent],
  providers: [BackofficePlayersStore],
  templateUrl: './backoffice-players-page.component.html',
  styleUrl: './backoffice-players-page.component.scss',
})
export class BackofficePlayersPageComponent implements OnInit {
  protected readonly store = inject(BackofficePlayersStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
