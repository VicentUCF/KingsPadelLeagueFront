import {
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  type ApplicationConfig,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { httpErrorToastInterceptor } from '@core/interceptors/http-error-toast.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpErrorToastInterceptor])),
  ],
};
