import { type Routes } from '@angular/router';

import { provideLeagueHomeFeature } from '@features/league-home/ui/providers/league-home.providers';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@features/league-home/ui/league-home.routes').then(
        (module) => module.LEAGUE_HOME_ROUTES,
      ),
  },
  {
    path: 'clasificacion',
    loadComponent: () =>
      import('@features/league-home/ui/pages/league-standings-page/league-standings-page.component').then(
        (module) => module.LeagueStandingsPageComponent,
      ),
    providers: [provideLeagueHomeFeature()],
  },
  {
    path: 'jugadores',
    loadChildren: () =>
      import('@features/players/ui/players.routes').then((module) => module.PLAYERS_ROUTES),
  },
  {
    path: 'jornadas',
    loadChildren: () =>
      import('@features/league-home/ui/league-matchdays.routes').then(
        (module) => module.LEAGUE_MATCHDAYS_ROUTES,
      ),
  },
  {
    path: 'equipos',
    loadChildren: () =>
      import('@features/league-home/ui/league-teams.routes').then(
        (module) => module.LEAGUE_TEAMS_ROUTES,
      ),
  },
  {
    path: 'calendario',
    loadComponent: () =>
      import('@features/league-home/ui/pages/league-calendar-page/league-calendar-page.component').then(
        (module) => module.LeagueCalendarPageComponent,
      ),
    providers: [provideLeagueHomeFeature()],
  },
  {
    path: '**',
    redirectTo: '',
  },
];
