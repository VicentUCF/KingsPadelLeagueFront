import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { PlayerCardComponent } from '../../components/player-card/player-card.component';
import { PlayersDirectoryStore } from '../../state/players-directory.store';

@Component({
  selector: 'app-players-directory-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'players-directory-page o-stack o-container',
  },
  imports: [EmptyStateComponent, PlayerCardComponent],
  providers: [PlayersDirectoryStore],
  templateUrl: './players-directory-page.component.html',
  styleUrl: './players-directory-page.component.scss',
})
export class PlayersDirectoryPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(PlayersDirectoryStore);

  ngOnInit(): void {
    this.title.setTitle('Jugadores | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content:
        'Consulta los perfiles de los jugadores participantes de KingsPadelLeague con su equipo y estadísticas actuales.',
    });

    void this.store.load();
  }

  protected reloadPlayers(): void {
    void this.store.load();
  }
}
