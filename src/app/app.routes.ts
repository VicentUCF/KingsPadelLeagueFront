import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('@features/league-home/ui/league-home.routes').then(
        (module) => module.LEAGUE_HOME_ROUTES,
      ),
  },
  {
    path: 'clasificacion',
    loadComponent: () =>
      import('@shared/ui/site-placeholder-page/site-placeholder-page.component').then(
        (module) => module.SitePlaceholderPageComponent,
      ),
    data: {
      title: 'Clasificación',
      description:
        'La vista completa de clasificación llegará en la siguiente fase del producto. La home ya muestra el estado actual de la liga.',
    },
  },
  {
    path: 'jornadas',
    loadComponent: () =>
      import('@shared/ui/site-placeholder-page/site-placeholder-page.component').then(
        (module) => module.SitePlaceholderPageComponent,
      ),
    data: {
      title: 'Jornadas',
      description:
        'La vista detallada de jornadas llegará en la siguiente fase. En la home ya tienes la próxima jornada y los últimos resultados.',
    },
  },
  {
    path: 'equipos',
    loadComponent: () =>
      import('@shared/ui/site-placeholder-page/site-placeholder-page.component').then(
        (module) => module.SitePlaceholderPageComponent,
      ),
    data: {
      title: 'Equipos',
      description:
        'La vista completa de equipos se implementará después. Desde la home puedes ver los cinco equipos participantes.',
    },
  },
  {
    path: 'calendario',
    loadComponent: () =>
      import('@shared/ui/site-placeholder-page/site-placeholder-page.component').then(
        (module) => module.SitePlaceholderPageComponent,
      ),
    data: {
      title: 'Calendario',
      description:
        'El calendario completo se publicará en una página propia. La home prioriza la lectura rápida del estado actual de la liga.',
    },
  },
  {
    path: '**',
    redirectTo: '',
  },
];
