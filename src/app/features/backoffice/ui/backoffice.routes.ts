import { type Routes } from '@angular/router';

import { BackofficeShellComponent } from './components/backoffice-shell/backoffice-shell.component';
import { provideBackofficeFeature } from './providers/backoffice.providers';

export const BACKOFFICE_ROUTES: Routes = [
  {
    path: '',
    component: BackofficeShellComponent,
    providers: [provideBackofficeFeature()],
    children: [
      {
        path: '',
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
      {
        path: 'temporadas',
        loadComponent: () =>
          import('./pages/backoffice-seasons-page/backoffice-seasons-page.component').then(
            (m) => m.BackofficeSeasonsPageComponent,
          ),
        data: {
          title: 'Temporadas',
          breadcrumb: 'Temporadas',
          description: 'Gestión de temporadas oficiales de la liga.',
        },
      },
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
        path: '**',
        redirectTo: '',
      },
    ],
  },
];
