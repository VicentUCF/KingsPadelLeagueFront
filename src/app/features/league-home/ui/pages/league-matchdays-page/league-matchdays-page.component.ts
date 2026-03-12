import { ChangeDetectionStrategy, Component, computed, inject, type OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ArrowUpRight, LucideAngularModule, Swords, Table2 } from 'lucide-angular';
import { CalendarDays } from 'lucide-angular';

import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

import { MatchdayCardComponent } from '../../components/matchday-card/matchday-card.component';
import {
  toLeagueMatchdaysPageViewModel,
  type LeagueMatchdaysPageViewModel,
} from '../../models/league-matchdays.viewmodel';
import { LeagueMatchdaysStore } from '../../state/league-matchdays.store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-league-matchdays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-matchdays-page',
  },
  imports: [EmptyStateComponent, LucideAngularModule, MatchdayCardComponent, RouterLink],
  providers: [LeagueMatchdaysStore],
  templateUrl: './league-matchdays-page.component.html',
  styleUrl: './league-matchdays-page.component.scss',
})
export class LeagueMatchdaysPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(LeagueMatchdaysStore);
  protected readonly swordsIcon = Swords;
  protected readonly standingsIcon = Table2;
  protected readonly arrowUpRightIcon = ArrowUpRight;
  protected readonly calendarIcon = CalendarDays;
  protected readonly emptyActions: readonly EmptyStateAction[] = [
    {
      label: 'Ver calendario general',
      href: '/calendario',
      tone: 'primary',
      icon: this.calendarIcon,
    },
    {
      label: 'Ver clasificación',
      href: '/clasificacion',
      tone: 'secondary',
      icon: this.standingsIcon,
    },
  ];

  protected readonly viewModel = computed<LeagueMatchdaysPageViewModel | null>(() => {
    const matchdays = this.store.matchdays();

    return matchdays.length > 0 ? toLeagueMatchdaysPageViewModel(matchdays) : null;
  });

  ngOnInit(): void {
    this.title.setTitle('Jornadas | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content:
        'Consulta las jornadas oficiales de la KingsPadelLeague con cruces, horarios y resultados de cada enfrentamiento.',
    });

    void this.store.load();
  }

  protected reloadMatchdays(): void {
    void this.store.load();
  }
}
