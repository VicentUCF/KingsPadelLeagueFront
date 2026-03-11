import { type Routes } from '@angular/router';

import { type BackofficeRole } from '../domain/entities/backoffice-role';
import { BackofficeShellComponent } from './components/backoffice-shell/backoffice-shell.component';
import { canActivateBackofficeRoute } from './guards/backoffice-role.guard';
import { BACKOFFICE_ROUTE_SEGMENTS } from './models/backoffice-navigation.model';
import { type BackofficeRouteData } from './models/backoffice-route-data';
import { BackofficeDashboardPageComponent } from './pages/backoffice-dashboard-page/backoffice-dashboard-page.component';
import { BackofficePlaceholderPageComponent } from './pages/backoffice-placeholder-page/backoffice-placeholder-page.component';
import { provideBackofficeFeature } from './providers/backoffice.providers';

const ALL_ROLES = ['ADMIN', 'PRESIDENT', 'USER'] as const satisfies readonly BackofficeRole[];
const ADMIN_AND_PRESIDENT = ['ADMIN', 'PRESIDENT'] as const satisfies readonly BackofficeRole[];
const ADMIN_ONLY = ['ADMIN'] as const satisfies readonly BackofficeRole[];

function createRouteData(
  title: string,
  description: string,
  allowedRoles: readonly BackofficeRole[],
): BackofficeRouteData {
  return {
    title,
    breadcrumb: title,
    description,
    allowedRoles,
  };
}

export const BACKOFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackofficeShellComponent,
    canActivateChild: [canActivateBackofficeRoute],
    providers: [provideBackofficeFeature()],
    children: [
      {
        path: '',
        component: BackofficeDashboardPageComponent,
        data: createRouteData(
          'Dashboard',
          'Visión operativa rápida de la temporada activa y sus bloqueos.',
          ALL_ROLES,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.seasons,
        loadChildren: () =>
          import('./backoffice-seasons.routes').then((module) => module.BACKOFFICE_SEASONS_ROUTES),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.teams,
        loadChildren: () =>
          import('./backoffice-teams.routes').then((module) => module.BACKOFFICE_TEAMS_ROUTES),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.players,
        loadChildren: () =>
          import('./backoffice-players.routes').then((module) => module.BACKOFFICE_PLAYERS_ROUTES),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.roster,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'Plantillas',
          'Este módulo concentrará altas, bajas, invitados y memberships activos.',
          ADMIN_AND_PRESIDENT,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.matchdays,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'Jornadas',
          'Aquí irá el contenedor operativo de jornadas, estados y cierres.',
          ADMIN_ONLY,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.fixtures,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'Fixtures',
          'Este será el centro operativo para convocatorias, resultados y ajustes.',
          ADMIN_AND_PRESIDENT,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.mvp,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'MVP',
          'Aquí se controlarán nominaciones, votos internos y voto público.',
          ALL_ROLES,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.users,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'Usuarios',
          'Este módulo conectará users, roles globales y vínculos con players.',
          ADMIN_ONLY,
        ),
      },
      {
        path: BACKOFFICE_ROUTE_SEGMENTS.audit,
        component: BackofficePlaceholderPageComponent,
        data: createRouteData(
          'Auditoría',
          'Este espacio reunirá decisiones, overrides y actividad sensible.',
          ADMIN_ONLY,
        ),
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
