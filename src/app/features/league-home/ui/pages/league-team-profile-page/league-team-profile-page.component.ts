import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  type OnDestroy,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Users } from 'lucide-angular';
import { Subscription } from 'rxjs';

import { SeoService } from '@core/services/seo.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { TeamPlayerCardComponent } from '../../components/team-player-card/team-player-card.component';
import { TeamShowcaseHeroComponent } from '../../components/team-showcase-hero/team-showcase-hero.component';
import {
  toLeagueTeamProfilePageViewModel,
  type LeagueTeamProfilePageViewModel,
} from '../../models/league-team-profile.viewmodel';
import { LeagueHomeStore } from '../../state/league-home.store';

@Component({
  selector: 'app-league-team-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-team-profile-page',
  },
  imports: [
    EmptyStateComponent,
    LucideAngularModule,
    RouterLink,
    TeamPlayerCardComponent,
    TeamShowcaseHeroComponent,
  ],
  providers: [LeagueHomeStore],
  templateUrl: './league-team-profile-page.component.html',
  styleUrl: './league-team-profile-page.component.scss',
})
export class LeagueTeamProfilePageComponent implements OnDestroy, OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(LeagueHomeStore);
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly rosterIcon = Users;
  protected readonly teamSlug = signal(this.route.snapshot.paramMap.get('slug') ?? '');

  protected readonly viewModel = computed<LeagueTeamProfilePageViewModel | null>(() => {
    const snapshot = this.store.snapshot();

    return snapshot ? toLeagueTeamProfilePageViewModel(snapshot, this.teamSlug()) : null;
  });

  protected readonly isTeamMissing = computed(() => {
    if (!this.store.hasSnapshot()) {
      return false;
    }

    return !this.viewModel();
  });

  constructor() {
    effect(() => {
      const viewModel = this.viewModel();

      if (viewModel) {
        const description = `${viewModel.team.name}: ${viewModel.team.tagline}. Explora la identidad del equipo y la plantilla completa de KingsPadelLeague.`;

        this.seo.setPage({
          title: `${viewModel.team.name} | KingsPadelLeague`,
          description,
          path: `/equipos/${this.teamSlug()}`,
          ogImage: viewModel.team.logoPath
            ? `https://kingspadelleague.com${viewModel.team.logoPath}`
            : undefined,
        });
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@type': 'SportsTeam',
          name: viewModel.team.name,
          url: `https://kingspadelleague.com/equipos/${this.teamSlug()}`,
          sport: 'Paddle Tennis',
          description,
          memberOf: {
            '@type': 'SportsOrganization',
            name: 'KingsPadelLeague',
            url: 'https://kingspadelleague.com/',
          },
        });

        return;
      }

      this.seo.removeJsonLd();

      if (this.isTeamMissing()) {
        this.seo.setPage({
          title: 'Equipo no encontrado | KingsPadelLeague',
          description:
            'No hemos encontrado el equipo solicitado. Vuelve al selector de equipos para abrir otro perfil.',
          path: '/equipos',
        });

        return;
      }

      this.seo.setPage({
        title: 'Equipos | KingsPadelLeague',
        description:
          'Explora la identidad visual y la plantilla completa de cada equipo de KingsPadelLeague.',
        path: '/equipos',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        this.teamSlug.set(paramMap.get('slug') ?? '');
      }),
    );

    void this.store.load();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
    this.seo.removeJsonLd();
  }

  protected reloadSnapshot(): void {
    void this.store.load();
  }
}
