import { type Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'matches',
  },
  {
    path: 'matches',
    loadChildren: () =>
      import('@features/matches/ui/upcoming-matches.routes').then(
        (module) => module.UPCOMING_MATCHES_ROUTES,
      ),
  },
  {
    path: '**',
    redirectTo: 'matches',
  },
];
