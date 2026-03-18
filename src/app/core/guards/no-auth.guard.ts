import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';

export const noAuthGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureInitialized().then(() => {
    if (!authStore.isAuthenticated()) {
      return true;
    }

    return router.createUrlTree(['/']);
  });
};
