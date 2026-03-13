import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { SeoService } from '@core/services/seo.service';
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
  private readonly seo = inject(SeoService);

  protected readonly store = inject(PlayersDirectoryStore);

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Jugadores | KingsPadelLeague',
      description:
        'Descubre los jugadores inscritos en la KingsPadelLeague y consulta su equipo, lado de juego y estadísticas.',
      path: '/jugadores',
    });

    void this.store.load();
  }

  protected reloadPlayers(): void {
    void this.store.load();
  }
}
