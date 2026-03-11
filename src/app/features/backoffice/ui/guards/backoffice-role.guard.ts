import { inject } from '@angular/core';
import { Router, type CanActivateChildFn } from '@angular/router';

import { BACKOFFICE_ROOT_PATH } from '../models/backoffice-navigation.model';
import { type BackofficeRouteData } from '../models/backoffice-route-data';
import { BackofficeSessionStore } from '../state/backoffice-session.store';

export const canActivateBackofficeRoute: CanActivateChildFn = (childRoute) => {
  const sessionStore = inject(BackofficeSessionStore);
  const router = inject(Router);
  const routeData = childRoute.data as Partial<BackofficeRouteData>;

  if (sessionStore.hasAccess(routeData.allowedRoles ?? [])) {
    return true;
  }

  return router.parseUrl(BACKOFFICE_ROOT_PATH);
};
