import { type Routes } from '@angular/router';

import { PlayerProfilePageComponent } from './pages/player-profile-page/player-profile-page.component';
import { PlayersDirectoryPageComponent } from './pages/players-directory-page/players-directory-page.component';
import { providePlayersFeature } from './providers/players.providers';

export const PLAYERS_ROUTES: Routes = [
  {
    path: '',
    providers: [providePlayersFeature()],
    children: [
      {
        path: '',
        component: PlayersDirectoryPageComponent,
      },
      {
        path: ':slug',
        component: PlayerProfilePageComponent,
      },
    ],
  },
];
