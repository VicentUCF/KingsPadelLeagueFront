import { type Routes } from '@angular/router';

import { type BackofficeRole } from '../domain/entities/backoffice-role';
import { BackofficeTeamDetailPageComponent } from './pages/backoffice-team-detail-page/backoffice-team-detail-page.component';
import { BackofficeTeamsPageComponent } from './pages/backoffice-teams-page/backoffice-teams-page.component';
import { provideBackofficeTeamsFeature } from './providers/backoffice-teams.providers';

const ADMIN_AND_PRESIDENT = ['ADMIN', 'PRESIDENT'] as const satisfies readonly BackofficeRole[];

export const BACKOFFICE_TEAMS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideBackofficeTeamsFeature()],
    children: [
      {
        path: '',
        component: BackofficeTeamsPageComponent,
        data: {
          title: 'Equipos',
          breadcrumb: 'Equipos',
          description: 'Listado operativo de equipos dentro de la season activa.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
      {
        path: ':teamId',
        component: BackofficeTeamDetailPageComponent,
        data: {
          title: 'Equipo',
          breadcrumb: 'Equipo',
          description: 'Detalle de equipo con roles, roster, fixtures, sanciones e histórico MVP.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
    ],
  },
];
