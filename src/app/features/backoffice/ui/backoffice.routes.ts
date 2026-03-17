import { type Routes } from '@angular/router';

import { BackofficeShellComponent } from './components/backoffice-shell/backoffice-shell.component';
import { provideBackofficeFeature } from './providers/backoffice.providers';
import { resolveAdminAccess } from '@app/core/guards/admin.guard';

export const BACKOFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackofficeShellComponent,
    providers: [provideBackofficeFeature()],
    children: [
      {
        path: '',
        canMatch: [resolveAdminAccess],
        loadComponent: () =>
          import('./pages/backoffice-dashboard-page/backoffice-dashboard-page.component').then(
            (m) => m.BackofficeDashboardPageComponent,
          ),
        data: {
          title: 'Dashboard',
          breadcrumb: 'Dashboard',
          description: 'Estado operativo actual de la liga.',
        },
      },
      // {
      //   path: 'temporadas',
      //   loadComponent: () =>
      //     import('./pages/backoffice-seasons-page/backoffice-seasons-page.component').then(
      //       (m) => m.BackofficeSeasonsPageComponent,
      //     ),
      //   data: {
      //     title: 'Temporadas',
      //     breadcrumb: 'Temporadas',
      //     description: 'Gestión de temporadas oficiales de la liga.',
      //   },
      // },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./pages/backoffice-teams-page/backoffice-teams-page.component').then(
            (m) => m.BackofficeTeamsPageComponent,
          ),
        data: {
          title: 'Equipos',
          breadcrumb: 'Equipos',
          description: 'Directorio y gestión de equipos participantes.',
        },
      },
      {
        path: 'equipos/:teamId',
        loadComponent: () =>
          import('./pages/backoffice-team-detail-page/backoffice-team-detail-page.component').then(
            (m) => m.BackofficeTeamDetailPageComponent,
          ),
        data: {
          title: 'Detalle del equipo',
          breadcrumb: 'Equipo',
          description: 'Plantilla y estadísticas del equipo.',
        },
      },
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./pages/backoffice-players-page/backoffice-players-page.component').then(
            (m) => m.BackofficePlayersPageComponent,
          ),
        data: {
          title: 'Jugadores',
          breadcrumb: 'Jugadores',
          description: 'Directorio de jugadores registrados en la liga.',
        },
      },
      {
        path: 'jornadas',
        loadComponent: () =>
          import('./pages/backoffice-matchdays-page/backoffice-matchdays-page.component').then(
            (m) => m.BackofficeMatchdaysPageComponent,
          ),
        data: {
          title: 'Jornadas',
          breadcrumb: 'Jornadas',
          description: 'Calendario y estado de todas las jornadas de la liga.',
        },
      },
      {
        path: 'jornadas/:matchdayId',
        loadComponent: () =>
          import('./pages/backoffice-matchday-detail-page/backoffice-matchday-detail-page.component').then(
            (m) => m.BackofficeMatchdayDetailPageComponent,
          ),
        data: {
          title: 'Detalle de jornada',
          breadcrumb: 'Jornada',
          description: 'Partidos y gestión de alineaciones de la jornada.',
        },
      },
      {
        path: 'clasificacion',
        loadComponent: () =>
          import('./pages/backoffice-standings-page/backoffice-standings-page.component').then(
            (m) => m.BackofficeStandingsPageComponent,
          ),
        data: {
          title: 'Clasificación',
          breadcrumb: 'Clasificación',
          description: 'Tabla de posiciones de la temporada actual.',
        },
      },
      {
        path: 'alineaciones',
        loadComponent: () =>
          import('./pages/backoffice-lineups-page/backoffice-lineups-page.component').then(
            (m) => m.BackofficeLineupsPageComponent,
          ),
        data: {
          title: 'Alineaciones',
          breadcrumb: 'Alineaciones',
          description: 'Gestión de alineaciones de los partidos.',
        },
      },
      {
        path: 'usuarios',
        canMatch: [resolveAdminAccess],
        loadComponent: () =>
          import('./pages/backoffice-users-page/backoffice-users-page.component').then(
            (m) => m.BackofficeUsersPageComponent,
          ),
        data: {
          title: 'Usuarios',
          breadcrumb: 'Usuarios',
          description: 'Directorio de usuarios y vinculación con jugadores.',
        },
      },
      {
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
