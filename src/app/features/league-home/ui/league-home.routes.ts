import { type Routes } from '@angular/router';

import { PreseasonHomePageComponent } from './pages/preseason-home-page/preseason-home-page.component';

export const LEAGUE_HOME_ROUTES: Routes = [
  {
    path: '',
    component: PreseasonHomePageComponent,
  },
];
