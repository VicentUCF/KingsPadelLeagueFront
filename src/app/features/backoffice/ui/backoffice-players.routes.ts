import { type Routes } from '@angular/router';

import { type BackofficeRole } from '../domain/entities/backoffice-role';
import { BackofficePlayerDetailPageComponent } from './pages/backoffice-player-detail-page/backoffice-player-detail-page.component';
import { BackofficePlayersPageComponent } from './pages/backoffice-players-page/backoffice-players-page.component';
import { provideBackofficePlayersFeature } from './providers/backoffice-players.providers';

const ADMIN_AND_PRESIDENT = ['ADMIN', 'PRESIDENT'] as const satisfies readonly BackofficeRole[];

export const BACKOFFICE_PLAYERS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideBackofficePlayersFeature()],
    children: [
      {
        path: '',
        component: BackofficePlayersPageComponent,
        data: {
          title: 'Jugadores',
          breadcrumb: 'Jugadores',
          description:
            'Directorio global de players con equipo actual derivado e histórico visible.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
      {
        path: ':playerId',
        component: BackofficePlayerDetailPageComponent,
        data: {
          title: 'Jugador',
          breadcrumb: 'Jugador',
          description:
            'Detalle de player con memberships, participaciones, nominaciones MVP y user vinculado.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
    ],
  },
];
