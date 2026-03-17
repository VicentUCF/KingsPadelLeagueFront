import { inject } from '@angular/core';
import { type CanMatchFn, Router } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';

export const backofficeAdminGuard: CanMatchFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (!authStore.isAuthenticated()) {
    return router.createUrlTree(['/auth/login']);
  }

  const role = authStore.currentRole();
  if (role === 'ADMIN') {
    return true;
  }

  if (role === 'PRESIDENT' || role === 'PLAYER') {
    return router.createUrlTree(['/backoffice']);
  }

  return router.createUrlTree(['/perfil']);
};
