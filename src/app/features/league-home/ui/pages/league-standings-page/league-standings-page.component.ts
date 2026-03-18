import { computed, ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Swords, Table2 } from 'lucide-angular';

import { SeoService } from '@core/services/seo.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

import { StandingsDetailTableComponent } from '../../components/standings-detail-table/standings-detail-table.component';
import {
  toLeagueStandingsPageViewModel,
  type LeagueStandingsPageViewModel,
} from '../../models/league-standings.viewmodel';
import { LeagueHomeStore } from '../../state/league-home.store';
import { LeagueMatchdaysStore } from '../../state/league-matchdays.store';

@Component({
  selector: 'app-league-standings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-standings-page',
  },
  imports: [
    EmptyStateComponent,
    LoadFeedbackComponent,
    LucideAngularModule,
    LoadingStateComponent,
    RouterLink,
    StandingsDetailTableComponent,
  ],
  providers: [LeagueHomeStore, LeagueMatchdaysStore],
  templateUrl: './league-standings-page.component.html',
  styleUrl: './league-standings-page.component.scss',
})
export class LeagueStandingsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly store = inject(LeagueHomeStore);
  protected readonly matchdaysStore = inject(LeagueMatchdaysStore);

  protected readonly standingsIcon = Table2;
  protected readonly matchdaysIcon = Swords;
  protected readonly calendarIcon = CalendarDays;
  protected readonly isLoading = computed(
    () => this.store.isLoading() || this.matchdaysStore.isLoading(),
  );
  protected readonly errorMessage = computed(
    () => this.store.errorMessage() ?? this.matchdaysStore.errorMessage(),
  );

  protected readonly viewModel = computed<LeagueStandingsPageViewModel | null>(() => {
    const snapshot = this.store.snapshot();

    if (!snapshot) {
      return null;
    }

    if (!this.matchdaysStore.hasContent() && !this.matchdaysStore.errorMessage()) {
      return null;
    }

    return toLeagueStandingsPageViewModel(snapshot, this.matchdaysStore.matchdays());
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Clasificación | KingsPadelLeague',
      description:
        'Consulta la clasificación oficial de la KingsPadelLeague y sigue la evolución de los equipos durante la temporada.',
      path: '/clasificacion',
    });

    void Promise.all([this.store.load(), this.matchdaysStore.load()]);
  }

  protected reloadSnapshot(): void {
    void Promise.all([this.store.load(true), this.matchdaysStore.load(true)]);
  }
}
