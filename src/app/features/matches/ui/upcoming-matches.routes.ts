import { type Routes } from '@angular/router';

import { provideUpcomingMatchesFeature } from './providers/upcoming-matches.providers';
import { UpcomingMatchesPageComponent } from './pages/upcoming-matches-page/upcoming-matches-page.component';

export const UPCOMING_MATCHES_ROUTES: Routes = [
  {
    path: '',
    component: UpcomingMatchesPageComponent,
    providers: [provideUpcomingMatchesFeature()],
  },
];
