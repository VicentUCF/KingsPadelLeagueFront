import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CalendarDays, LucideAngularModule, Shield, Table2, Trophy, Users } from 'lucide-angular';

import { applicationMetadata } from '@core/config/application-metadata';
import { SeoService } from '@core/services/seo.service';
import {
  EmptyStateComponent,
  type EmptyStateAction,
} from '@shared/ui/empty-state/empty-state.component';

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
  private readonly seo = inject(SeoService);

  protected readonly store = inject(LeagueHomeStore);

  protected readonly nextMatchdayIcon = CalendarDays;
  protected readonly standingsIcon = Table2;
  protected readonly resultsIcon = Trophy;
  protected readonly teamsIcon = Shield;
  protected readonly playersIcon = Users;
  protected readonly nextMatchdayEmptyActions: readonly EmptyStateAction[] = [
    {
      label: 'Ver equipos inscritos',
      href: '/equipos',
      tone: 'primary',
      icon: this.teamsIcon,
    },
    {
      label: 'Consultar jugadores',
      href: '/jugadores',
      tone: 'secondary',
      icon: this.playersIcon,
    },
  ];
  protected readonly resultsEmptyActions: readonly EmptyStateAction[] = [
    {
      label: 'Ver clasificación',
      href: '/clasificacion',
      tone: 'primary',
      icon: this.standingsIcon,
    },
    {
      label: 'Ver equipos',
      href: '/equipos',
      tone: 'secondary',
      icon: this.teamsIcon,
    },
  ];

  ngOnInit(): void {
    this.seo.setPage({
      title: 'KingsPadelLeague | Liga amateur de pádel por equipos',
      description: applicationMetadata.description,
      path: '/',
    });
    this.seo.setJsonLd({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': 'https://kingspadelleague.com/#website',
          url: 'https://kingspadelleague.com/',
          name: applicationMetadata.name,
          description: applicationMetadata.description,
          inLanguage: 'es',
        },
        {
          '@type': 'SportsOrganization',
          '@id': 'https://kingspadelleague.com/#organization',
          name: applicationMetadata.name,
          url: 'https://kingspadelleague.com/',
          logo: 'https://kingspadelleague.com/kpl-logo-wordmark.png',
          description: applicationMetadata.tagline,
          sport: 'Paddle Tennis',
        },
      ],
    });

    void this.store.load();
  }

  protected reloadSnapshot(): void {
    void this.store.load();
  }
}
