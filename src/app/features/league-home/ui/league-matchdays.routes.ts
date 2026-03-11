import { type Routes } from '@angular/router';

import { provideLeagueHomeFeature } from './providers/league-home.providers';
import { LeagueMatchdayDetailPageComponent } from './pages/league-matchday-detail-page/league-matchday-detail-page.component';
import { LeagueMatchdaysPageComponent } from './pages/league-matchdays-page/league-matchdays-page.component';

export const LEAGUE_MATCHDAYS_ROUTES: Routes = [
  {
    path: '',
    component: LeagueMatchdaysPageComponent,
    providers: [provideLeagueHomeFeature()],
  },
  {
    path: ':matchdayId',
    component: LeagueMatchdayDetailPageComponent,
    providers: [provideLeagueHomeFeature()],
  },
];
