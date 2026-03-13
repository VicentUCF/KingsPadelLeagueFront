import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Shield, Swords, Table2 } from 'lucide-angular';

import { SeoService } from '@core/services/seo.service';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

import { CalendarDayGroupComponent } from '../../components/calendar-day-group/calendar-day-group.component';
import { CalendarFiltersPanelComponent } from '../../components/calendar-filters-panel/calendar-filters-panel.component';
import {
  ALL_CALENDAR_STATUS_FILTER,
  ALL_CALENDAR_TEAM_FILTER,
  toLeagueCalendarPageViewModel,
  type CalendarStatusFilter,
  type CalendarTeamFilter,
  type LeagueCalendarPageViewModel,
} from '../../models/league-calendar.viewmodel';
import { LeagueCalendarStore } from '../../state/league-calendar.store';

@Component({
  selector: 'app-league-calendar-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-calendar-page',
  },
  imports: [
    CalendarDayGroupComponent,
    CalendarFiltersPanelComponent,
    EmptyStateComponent,
    LucideAngularModule,
    RouterLink,
  ],
  providers: [LeagueCalendarStore],
  templateUrl: './league-calendar-page.component.html',
  styleUrl: './league-calendar-page.component.scss',
})
export class LeagueCalendarPageComponent implements OnInit {
  private readonly seo = inject(SeoService);

  protected readonly store = inject(LeagueCalendarStore);
  protected readonly selectedStatusFilter = signal<CalendarStatusFilter>(
    ALL_CALENDAR_STATUS_FILTER,
  );
  protected readonly selectedTeamFilter = signal<CalendarTeamFilter>(ALL_CALENDAR_TEAM_FILTER);

  protected readonly calendarIcon = CalendarDays;
  protected readonly matchdaysIcon = Swords;
  protected readonly standingsIcon = Table2;
  protected readonly teamsIcon = Shield;
  protected readonly emptyActions: readonly EmptyStateAction[] = [
    {
      label: 'Ver jornadas',
      href: '/jornadas',
      tone: 'primary',
      icon: this.matchdaysIcon,
    },
    {
      label: 'Ver equipos inscritos',
      href: '/equipos',
      tone: 'secondary',
      icon: this.teamsIcon,
    },
  ];

  protected readonly viewModel = computed<LeagueCalendarPageViewModel | null>(() => {
    const snapshot = this.store.snapshot();

    if (!snapshot || !this.store.hasMatchdays()) {
      return null;
    }

    return toLeagueCalendarPageViewModel(snapshot, this.store.matchdays(), {
      status: this.selectedStatusFilter(),
      team: this.selectedTeamFilter(),
    });
  });

  ngOnInit(): void {
    this.seo.setPage({
      title: 'Calendario | KingsPadelLeague',
      description:
        'Consulta el calendario oficial de partidos de la KingsPadelLeague con fechas, horarios y enfrentamientos.',
      path: '/calendario',
    });

    void this.store.load();
  }

  protected selectStatusFilter(statusFilter: CalendarStatusFilter): void {
    this.selectedStatusFilter.set(statusFilter);
  }

  protected selectTeamFilter(teamFilter: CalendarTeamFilter): void {
    this.selectedTeamFilter.set(teamFilter);
  }

  protected clearFilters(): void {
    this.selectedStatusFilter.set(ALL_CALENDAR_STATUS_FILTER);
    this.selectedTeamFilter.set(ALL_CALENDAR_TEAM_FILTER);
  }

  protected reloadCalendar(): void {
    void this.store.load();
  }
}
