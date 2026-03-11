import { type Routes } from '@angular/router';

import { type BackofficeRole } from '../domain/entities/backoffice-role';
import { BackofficeSeasonDetailPageComponent } from './pages/backoffice-season-detail-page/backoffice-season-detail-page.component';
import { BackofficeSeasonsPageComponent } from './pages/backoffice-seasons-page/backoffice-seasons-page.component';
import { provideBackofficeSeasonsFeature } from './providers/backoffice-seasons.providers';

const ADMIN_ONLY = ['ADMIN'] as const satisfies readonly BackofficeRole[];

export const BACKOFFICE_SEASONS_ROUTES: Routes = [
  {
    path: '',
    providers: [provideBackofficeSeasonsFeature()],
    children: [
      {
        path: '',
        component: BackofficeSeasonsPageComponent,
        data: {
          title: 'Temporadas',
          breadcrumb: 'Temporadas',
          description: 'Gestión de seasons, estados operativos y trazabilidad histórica.',
          allowedRoles: ADMIN_ONLY,
        },
      },
      {
        path: ':seasonId',
        component: BackofficeSeasonDetailPageComponent,
        data: {
          title: 'Temporada',
          breadcrumb: 'Temporada',
          description:
            'Detalle de season con snapshot operativo, equipos, jornadas y clasificación.',
          allowedRoles: ADMIN_ONLY,
        },
      },
    ],
  },
];
