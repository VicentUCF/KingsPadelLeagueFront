import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';

export const backofficeAccessGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  return authStore.ensureInitialized().then(() => {
    if (!authStore.isAuthenticated()) {
      return router.createUrlTree(['/auth/login']);
    }

    const role = authStore.currentRole();
    if (role === 'ADMIN' || role === 'PRESIDENT' || role === 'PLAYER') {
      return true;
    }

    return router.createUrlTree(['/perfil']);
  });
};
