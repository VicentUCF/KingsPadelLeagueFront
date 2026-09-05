import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';
import { environment } from '../../../environments/environment';

export const publicSiteGuard: CanMatchFn = () => {
  if (environment.publicSiteEnabled) {
    return true;
  }

  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureInitialized().then(() => {
    if (authStore.isAuthenticated()) {
      return router.createUrlTree(['/backoffice']);
    }

    return router.createUrlTree(['/auth/login']);
  });
};
