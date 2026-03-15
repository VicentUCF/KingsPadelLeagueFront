import { inject } from '@angular/core';
import { type HttpInterceptorFn } from '@angular/common/http';

import { AuthStore } from '@features/auth/ui/state/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.accessToken();

  if (token && !req.headers.has('Authorization')) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
