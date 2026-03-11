import { Injectable, signal } from '@angular/core';

const MAX_TOASTS = 3;
const TOAST_TIMEOUT_MS = 4000;

export type ActionToastTone = 'success' | 'error' | 'info';
export type ActionToastPoliteness = 'polite' | 'assertive';

export interface ActionToast {
  readonly id: string;
  readonly tone: ActionToastTone;
  readonly title: string;
  readonly message: string;
  readonly politeness: ActionToastPoliteness;
}

@Injectable({
  providedIn: 'root',
})
export class ActionToastStore {
  private toastSequence = 0;
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<readonly ActionToast[]>([]);

  success(message: string, title = 'Acción completada'): void {
    this.enqueueToast('success', title, message);
  }

  error(message: string, title = 'No se ha podido completar la acción'): void {
    this.enqueueToast('error', title, message);
  }

  info(message: string, title = 'Información'): void {
    this.enqueueToast('info', title, message);
  }

  dismiss(toastId: string): void {
    this.clearTimer(toastId);
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== toastId));
  }

  private enqueueToast(tone: ActionToastTone, title: string, message: string): void {
    const toast: ActionToast = {
      id: `action-toast-${this.toastSequence + 1}`,
      tone,
      title,
      message,
      politeness: tone === 'error' ? 'assertive' : 'polite',
    };

    this.toastSequence += 1;
    this.toasts.update((toasts) => {
      const nextToasts = [...toasts, toast];

      if (nextToasts.length <= MAX_TOASTS) {
        return nextToasts;
      }

      const droppedToast = nextToasts[0];

      if (!droppedToast) {
        return nextToasts;
      }

      this.clearTimer(droppedToast.id);

      return nextToasts.slice(nextToasts.length - MAX_TOASTS);
    });
    this.scheduleDismiss(toast.id);
  }

  private scheduleDismiss(toastId: string): void {
    const timerId = globalThis.setTimeout(() => {
      this.dismiss(toastId);
    }, TOAST_TIMEOUT_MS);

    this.timers.set(toastId, timerId);
  }

  private clearTimer(toastId: string): void {
    const timerId = this.timers.get(toastId);

    if (timerId === undefined) {
      return;
    }

    clearTimeout(timerId);
    this.timers.delete(toastId);
  }
}
