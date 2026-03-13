import { computed, ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Swords, Table2 } from 'lucide-angular';

import { SeoService } from '@core/services/seo.service';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { StandingsTableComponent } from '../../components/standings-table/standings-table.component';
import {
  toLeagueStandingsPageViewModel,
  type LeagueStandingsPageViewModel,
} from '../../models/league-standings.viewmodel';
import { LeagueHomeStore } from '../../state/league-home.store';

@Component({
  selector: 'app-league-standings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-standings-page',
  },
  imports: [EmptyStateComponent, LucideAngularModule, RouterLink, StandingsTableComponent],
  providers: [LeagueHomeStore],
  templateUrl: './league-standings-page.component.html',
  styleUrl: './league-standings-page.component.scss',
})
export class LeagueStandingsPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly store = inject(LeagueHomeStore);

  protected readonly standingsIcon = Table2;
  protected readonly matchdaysIcon = Swords;
  protected readonly calendarIcon = CalendarDays;

  protected readonly viewModel = computed<LeagueStandingsPageViewModel | null>(() => {
    const snapshot = this.store.snapshot();

    return snapshot ? toLeagueStandingsPageViewModel(snapshot) : null;
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Clasificación | KingsPadelLeague',
      description:
        'Consulta la clasificación oficial de la KingsPadelLeague y sigue la evolución de los equipos durante la temporada.',
      path: '/clasificacion',
    });

    void this.store.load();
  }

  protected reloadSnapshot(): void {
    void this.store.load();
  }
}
