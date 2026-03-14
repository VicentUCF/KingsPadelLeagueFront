import { Injectable, signal } from '@angular/core';

const MAX_TOASTS = 3;
const DEDUPE_WINDOW_MS = 3000;

const TONE_DURATIONS: Record<ActionToastTone, number> = {
  success: 3500,
  info: 4200,
  warning: 5200,
  error: 7000,
};

export type ActionToastTone = 'success' | 'error' | 'info' | 'warning';
export type ActionToastPoliteness = 'polite' | 'assertive';

export interface ActionToast {
  readonly id: string;
  readonly tone: ActionToastTone;
  readonly title: string;
  readonly message: string;
  readonly politeness: ActionToastPoliteness;
}

export interface ActionToastOptions {
  readonly dedupeKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ActionToastStore {
  private toastSequence = 0;
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly dedupeKeys = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = signal<readonly ActionToast[]>([]);

  success(message: string, title = 'Acción completada', options?: ActionToastOptions): void {
    if (this.isDedupe(options?.dedupeKey)) return;
    this.trackDedupe(options?.dedupeKey);
    this.enqueueToast('success', title, message);
  }

  error(
    message: string,
    title = 'No se ha podido completar la acción',
    options?: ActionToastOptions,
  ): void {
    if (this.isDedupe(options?.dedupeKey)) return;
    this.trackDedupe(options?.dedupeKey);
    this.enqueueToast('error', title, message);
  }

  info(message: string, title = 'Información', options?: ActionToastOptions): void {
    if (this.isDedupe(options?.dedupeKey)) return;
    this.trackDedupe(options?.dedupeKey);
    this.enqueueToast('info', title, message);
  }

  warning(message: string, title = 'Aviso', options?: ActionToastOptions): void {
    if (this.isDedupe(options?.dedupeKey)) return;
    this.trackDedupe(options?.dedupeKey);
    this.enqueueToast('warning', title, message);
  }

  dismiss(toastId: string): void {
    this.clearTimer(toastId);
    this.toasts.update((toasts) => toasts.filter((toast) => toast.id !== toastId));
  }

  private isDedupe(key: string | undefined): boolean {
    if (!key) return false;
    return this.dedupeKeys.has(key);
  }

  private trackDedupe(key: string | undefined): void {
    if (!key) return;
    const existing = this.dedupeKeys.get(key);
    if (existing !== undefined) clearTimeout(existing);
    const timerId = globalThis.setTimeout(() => {
      this.dedupeKeys.delete(key);
    }, DEDUPE_WINDOW_MS);
    this.dedupeKeys.set(key, timerId);
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
    this.scheduleDismiss(toast.id, TONE_DURATIONS[tone]);
  }

  private scheduleDismiss(toastId: string, durationMs: number): void {
    const timerId = globalThis.setTimeout(() => {
      this.dismiss(toastId);
    }, durationMs);

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
