import { type Routes } from '@angular/router';

import { type BackofficeRole } from '../domain/entities/backoffice-role';
import { BackofficeRosterDetailPageComponent } from './pages/backoffice-roster-detail-page/backoffice-roster-detail-page.component';
import { BackofficeRostersPageComponent } from './pages/backoffice-rosters-page/backoffice-rosters-page.component';
import { provideBackofficeRostersFeature } from './providers/backoffice-rosters.providers';

const ADMIN_AND_PRESIDENT = ['ADMIN', 'PRESIDENT'] as const satisfies readonly BackofficeRole[];

export const BACKOFFICE_ROSTERS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideBackofficeRostersFeature()],
    children: [
      {
        path: '',
        component: BackofficeRostersPageComponent,
        data: {
          title: 'Plantillas',
          breadcrumb: 'Plantillas',
          description:
            'Vista activa de memberships, invitados y solicitudes pendientes por equipo.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
      {
        path: ':rosterId',
        component: BackofficeRosterDetailPageComponent,
        data: {
          title: 'Plantilla',
          breadcrumb: 'Plantilla',
          description:
            'Detalle operativo de memberships activas, histórico de altas y restricciones visibles.',
          allowedRoles: ADMIN_AND_PRESIDENT,
        },
      },
    ],
  },
];
