import { type Routes } from '@angular/router';

import { provideLeagueHomeFeature } from './providers/league-home.providers';
import { LeagueTeamProfilePageComponent } from './pages/league-team-profile-page/league-team-profile-page.component';
import { LeagueTeamsPageComponent } from './pages/league-teams-page/league-teams-page.component';

export const LEAGUE_TEAMS_ROUTES: Routes = [
  {
    path: '',
    component: LeagueTeamsPageComponent,
    providers: [provideLeagueHomeFeature()],
  },
  {
    path: ':slug',
    component: LeagueTeamProfilePageComponent,
    providers: [provideLeagueHomeFeature()],
  },
];
