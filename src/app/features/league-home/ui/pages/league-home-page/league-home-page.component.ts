import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Shield, Table2, Trophy } from 'lucide-angular';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { applicationMetadata } from '@core/config/application-metadata';

import { ByeCardComponent } from '../../components/bye-card/bye-card.component';
import { HeroLeagueStatusComponent } from '../../components/hero-league-status/hero-league-status.component';
import { MatchCardComponent } from '../../components/match-card/match-card.component';
import { ResultCardComponent } from '../../components/result-card/result-card.component';
import { StandingsTableComponent } from '../../components/standings-table/standings-table.component';
import { TeamCardComponent } from '../../components/team-card/team-card.component';
import { LeagueHomeStore } from '../../state/league-home.store';

@Component({
  selector: 'app-league-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-home-page',
  },
  imports: [
    ByeCardComponent,
    EmptyStateComponent,
    HeroLeagueStatusComponent,
    LucideAngularModule,
    MatchCardComponent,
    ResultCardComponent,
    RouterLink,
    StandingsTableComponent,
    TeamCardComponent,
  ],
  providers: [LeagueHomeStore],
  templateUrl: './league-home-page.component.html',
  styleUrl: './league-home-page.component.scss',
})
export class LeagueHomePageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(LeagueHomeStore);

  protected readonly nextMatchdayIcon = CalendarDays;
  protected readonly standingsIcon = Table2;
  protected readonly resultsIcon = Trophy;
  protected readonly teamsIcon = Shield;

  ngOnInit(): void {
    this.title.setTitle('KingsPadelLeague | Liga de Pádel Competitiva');
    this.meta.updateTag({
      name: 'description',
      content: applicationMetadata.description,
    });

    void this.store.load();
  }

  protected reloadSnapshot(): void {
    void this.store.load();
  }
}
