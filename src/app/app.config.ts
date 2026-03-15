import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { authInterceptor } from '@core/interceptors/auth.interceptor';
import { httpErrorToastInterceptor } from '@core/interceptors/http-error-toast.interceptor';
import { provideAuthFeature } from '@features/auth/ui/providers/auth.providers';
import { environment } from '../environments/environment';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, httpErrorToastInterceptor])),
    { provide: API_BASE_URL, useValue: environment.apiBaseUrl },
    provideAuthFeature(),
  ],
};
