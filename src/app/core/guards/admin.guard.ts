import { inject } from '@angular/core';
import { Router, type UrlTree } from '@angular/router';
import { AuthStore } from '@app/features/auth/ui/state/auth.store';

export const resolveAdminAccess = (targetUrl: string | null): boolean | UrlTree => {
  const authStore = inject(AuthStore);

  const router = inject(Router);

  const rol = authStore.currentRole();
  if (rol === 'ADMIN') {
    return true;
  }

  const extras = targetUrl ? { queryParams: { redirectTo: targetUrl } } : undefined;

  return router.createUrlTree(['/admin/acceso'], extras);
};
