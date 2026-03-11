import { ActionToastStore } from './action-toast.store';

describe('ActionToastStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('keeps at most three toasts and removes them automatically', () => {
    const store = new ActionToastStore();

    store.success('Equipo creado');
    store.info('Season guardada');
    store.error('No se ha podido archivar');
    store.success('Jugador actualizado');

    expect(store.toasts().map((toast) => toast.message)).toEqual([
      'Season guardada',
      'No se ha podido archivar',
      'Jugador actualizado',
    ]);

    jest.advanceTimersByTime(4000);

    expect(store.toasts()).toHaveLength(0);
  });

  it('allows manual dismiss', () => {
    const store = new ActionToastStore();

    store.success('Equipo creado');

    const toastId = store.toasts()[0]?.id;

    expect(toastId).toBeDefined();

    store.dismiss(toastId!);

    expect(store.toasts()).toHaveLength(0);
  });
});
