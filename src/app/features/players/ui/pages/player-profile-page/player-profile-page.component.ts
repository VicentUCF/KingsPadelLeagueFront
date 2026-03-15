import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArrowLeft, LucideAngularModule } from 'lucide-angular';

import { NavigationHistoryService } from '@core/services/navigation-history.service';
import { SeoService } from '@core/services/seo.service';
import { UNASSIGNED_PLAYER_TEAM_NAME } from '@features/players/domain/entities/player.entity';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { PlayerProfileCardComponent } from '../../components/player-profile-card/player-profile-card.component';
import { PlayerProfileStore } from '../../state/player-profile.store';

@Component({
  selector: 'app-player-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-profile-page o-stack o-container',
  },
  imports: [EmptyStateComponent, LucideAngularModule, NgOptimizedImage, PlayerProfileCardComponent],
  providers: [PlayerProfileStore],
  templateUrl: './player-profile-page.component.html',
  styleUrl: './player-profile-page.component.scss',
})
export class PlayerProfilePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly seo = inject(SeoService);
  private readonly navHistory = inject(NavigationHistoryService);

  protected readonly store = inject(PlayerProfileStore);
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly unassignedTeamName = UNASSIGNED_PLAYER_TEAM_NAME;
  protected readonly playerSlug = signal('');

  protected goBack(): void {
    this.navHistory.goBack('/jugadores');
  }

  constructor() {
    effect(() => {
      const player = this.store.player();

      if (player) {
        this.seo.setPage({
          title: player.pageTitle,
          description: player.metaDescription,
          path: `/jugadores/${this.playerSlug()}`,
        });
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: player.displayName,
          description: player.metaDescription,
          url: `https://kingspadelleague.com/jugadores/${this.playerSlug()}`,
          affiliation: {
            '@type': 'SportsTeam',
            name: player.teamName,
            memberOf: {
              '@type': 'SportsOrganization',
              name: 'KingsPadelLeague',
              url: 'https://kingspadelleague.com/',
            },
          },
        });

        return;
      }

      this.seo.removeJsonLd();

      if (this.store.isNotFound()) {
        this.seo.setPage({
          title: 'Jugador no encontrado | KingsPadelLeague',
          description: 'El perfil solicitado no está disponible en el directorio de jugadores.',
          path: '/jugadores',
        });

        return;
      }

      this.seo.setPage({
        title: 'Perfil de jugador | KingsPadelLeague',
        description:
          'Consulta el perfil individual de un jugador de KingsPadelLeague con estado de equipo y estadísticas.',
        path: '/jugadores',
      });
    });
  }

  ngOnInit(): void {
    const routeParamMapSubscription = this.route.paramMap.subscribe((paramMap) => {
      const slug = paramMap.get('slug') ?? '';

      this.playerSlug.set(slug);
      void this.store.load(slug);
    });

    this.destroyRef.onDestroy(() => {
      routeParamMapSubscription.unsubscribe();
      this.seo.removeJsonLd();
    });
  }
}
