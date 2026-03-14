import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { httpErrorToastInterceptor } from '@core/interceptors/http-error-toast.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorToastInterceptor])),
    { provide: API_BASE_URL, useValue: 'http://localhost:3000' },
  ],
};
