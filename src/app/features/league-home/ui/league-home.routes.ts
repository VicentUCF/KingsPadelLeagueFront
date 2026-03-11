import { type Routes } from '@angular/router';

import { LeagueHomePageComponent } from './pages/league-home-page/league-home-page.component';
import { provideLeagueHomeFeature } from './providers/league-home.providers';

export const LEAGUE_HOME_ROUTES: Routes = [
  {
    path: '',
    component: LeagueHomePageComponent,
    providers: [provideLeagueHomeFeature()],
  },
];
