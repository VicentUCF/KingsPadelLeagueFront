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
import { ArrowLeft, LucideAngularModule, Swords } from 'lucide-angular';

import { SeoService } from '@core/services/seo.service';
import { Subscription } from 'rxjs';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { ByeCardComponent } from '../../components/bye-card/bye-card.component';
import { MatchdayEncounterCardComponent } from '../../components/matchday-encounter-card/matchday-encounter-card.component';
import {
  toLeagueMatchdayDetailPageViewModel,
  type LeagueMatchdayDetailPageViewModel,
} from '../../models/league-matchday-detail.viewmodel';
import { LeagueMatchdaysStore } from '../../state/league-matchdays.store';

@Component({
  selector: 'app-league-matchday-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-matchday-detail-page',
  },
  imports: [
    ByeCardComponent,
    EmptyStateComponent,
    LucideAngularModule,
    MatchdayEncounterCardComponent,
    RouterLink,
  ],
  providers: [LeagueMatchdaysStore],
  templateUrl: './league-matchday-detail-page.component.html',
  styleUrl: './league-matchday-detail-page.component.scss',
})
export class LeagueMatchdayDetailPageComponent implements OnDestroy, OnInit {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly routeSubscription = new Subscription();

  protected readonly store = inject(LeagueMatchdaysStore);
  protected readonly arrowLeftIcon = ArrowLeft;
  protected readonly swordsIcon = Swords;
  protected readonly matchdayId = signal(this.route.snapshot.paramMap.get('matchdayId') ?? '');

  protected readonly viewModel = computed<LeagueMatchdayDetailPageViewModel | null>(() => {
    return toLeagueMatchdayDetailPageViewModel(this.store.matchdays(), this.matchdayId());
  });

  protected readonly isMatchdayMissing = computed(() => {
    if (!this.store.hasMatchdays()) {
      return false;
    }

    return this.viewModel() === null;
  });

  constructor() {
    effect(() => {
      const viewModel = this.viewModel();

      if (viewModel) {
        this.seo.setPage({
          title: `${viewModel.title} | KingsPadelLeague`,
          description: `${viewModel.title}: ${viewModel.description}`,
          path: `/jornadas/${this.matchdayId()}`,
        });

        return;
      }

      if (this.isMatchdayMissing()) {
        this.seo.setPage({
          title: 'Jornada no encontrada | KingsPadelLeague',
          description:
            'No hemos encontrado la jornada solicitada. Vuelve al listado para abrir otra jornada publicada.',
          path: '/jornadas',
        });

        return;
      }

      this.seo.setPage({
        title: 'Jornadas | KingsPadelLeague',
        description:
          'Consulta las jornadas de KingsPadelLeague para revisar cruces y resultados por pareja.',
        path: '/jornadas',
      });
    });
  }

  ngOnInit(): void {
    this.routeSubscription.add(
      this.route.paramMap.subscribe((paramMap) => {
        this.matchdayId.set(paramMap.get('matchdayId') ?? '');
      }),
    );

    void this.store.load();
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }

  protected reloadMatchdays(): void {
    void this.store.load();
  }
}
