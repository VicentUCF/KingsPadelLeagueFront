import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { ActionToastStore } from '@core/state/action-toast.store';

import { ActionToastOutletComponent } from './action-toast-outlet.component';

describe('ActionToastOutletComponent', () => {
  it('renders and dismisses global action toasts', async () => {
    const { fixture } = await render(ActionToastOutletComponent);
    const store = fixture.componentRef.injector.get(ActionToastStore);

    store.success('Equipo creado correctamente');
    fixture.detectChanges();

    expect(await screen.findByRole('status')).toHaveTextContent(/Equipo creado correctamente/i);

    screen.getByRole('button', { name: /Cerrar notificación/i }).click();
    fixture.detectChanges();

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('has no accessibility violations with visible toasts', async () => {
    const { container, fixture } = await render(ActionToastOutletComponent);
    const store = fixture.componentRef.injector.get(ActionToastStore);

    store.error('No se ha podido guardar la season');
    fixture.detectChanges();

    await screen.findByRole('alert');

    expect(await axe(container)).toHaveNoViolations();
  });
});
