import {
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ActionToastStore } from '@core/state/action-toast.store';

export interface HttpErrorToastConfig {
  enabled: boolean;
  message?: string;
  key?: string;
}

const HTTP_ERROR_TOAST_CONTEXT = new HttpContextToken<HttpErrorToastConfig>(() => ({
  enabled: false,
}));

export const withHttpErrorToast = (
  config: Omit<HttpErrorToastConfig, 'enabled'> = {},
): HttpContext => new HttpContext().set(HTTP_ERROR_TOAST_CONTEXT, { enabled: true, ...config });

export const httpErrorToastInterceptor: HttpInterceptorFn = (req, next) => {
  const toastStore = inject(ActionToastStore);
  const config = req.context.get(HTTP_ERROR_TOAST_CONTEXT);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (config.enabled) {
        const message = config.message ?? normalizeHttpError(error);
        const key = config.key ?? `http-error:${req.method}:${req.url}`;
        toastStore.error(message, undefined, { dedupeKey: key });
      }

      return throwError(() => error);
    }),
  );
};

const normalizeHttpError = (error: unknown): string => {
  if (error instanceof HttpErrorResponse) {
    const payloadMessage = extractMessage(error.error);
    if (payloadMessage) {
      return payloadMessage;
    }

    if (error.status === 0) {
      return 'No se pudo conectar con el servidor. Revisa tu conexión.';
    }
    if (error.status === 400) {
      return 'La solicitud no es válida. Revisa los datos e inténtalo de nuevo.';
    }
    if (error.status === 401 || error.status === 403) {
      return 'Tu sesión no es válida. Inicia sesión de nuevo.';
    }
    if (error.status === 404) {
      return 'No se encontró el recurso solicitado.';
    }
    if (error.status === 409) {
      return 'La solicitud entra en conflicto con el estado actual.';
    }
    if (error.status >= 500) {
      return 'El servidor no responde ahora mismo. Inténtalo más tarde.';
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado. Inténtalo de nuevo.';
};

const extractMessage = (payload: unknown): string | null => {
  if (!payload) {
    return null;
  }

  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    return trimmed.length ? trimmed : null;
  }

  if (typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const message = record['message'];
    if (typeof message === 'string' && message.trim()) {
      return message.trim();
    }
    const errorMessage = record['error'];
    if (typeof errorMessage === 'string' && errorMessage.trim()) {
      return errorMessage.trim();
    }
  }

  return null;
};
