import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { PlayerProfileCardComponent } from '../../components/player-profile-card/player-profile-card.component';
import { PlayerProfileStore } from '../../state/player-profile.store';

@Component({
  selector: 'app-player-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-profile-page o-stack o-container',
  },
  imports: [
    EmptyStateComponent,
    LucideAngularModule,
    NgOptimizedImage,
    PlayerProfileCardComponent,
    RouterLink,
  ],
  providers: [PlayerProfileStore],
  templateUrl: './player-profile-page.component.html',
  styleUrl: './player-profile-page.component.scss',
})
export class PlayerProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(PlayerProfileStore);
  protected readonly arrowLeftIcon = ArrowLeft;

  constructor() {
    effect(() => {
      const player = this.store.player();

      if (player) {
        this.title.setTitle(player.pageTitle);
        this.meta.updateTag({
          name: 'description',
          content: player.metaDescription,
        });
        return;
      }

      if (this.store.isNotFound()) {
        this.title.setTitle('Jugador no encontrado | KingsPadelLeague');
        this.meta.updateTag({
          name: 'description',
          content: 'El perfil solicitado no está disponible en el directorio de jugadores.',
        });
        return;
      }

      this.title.setTitle('Perfil de jugador | KingsPadelLeague');
      this.meta.updateTag({
        name: 'description',
        content:
          'Consulta el perfil individual de un jugador de KingsPadelLeague con equipo y estadísticas.',
      });
    });
  }

  ngOnInit(): void {
    const routeParamMapSubscription = this.route.paramMap.subscribe((paramMap) => {
      void this.store.load(paramMap.get('slug'));
    });

    this.destroyRef.onDestroy(() => {
      routeParamMapSubscription.unsubscribe();
    });
  }
}
