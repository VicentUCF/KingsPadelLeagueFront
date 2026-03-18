import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { LoadFeedbackComponent } from './load-feedback.component';

describe('LoadFeedbackComponent', () => {
  it('renders the error tone and emits retry', async () => {
    const onRetry = jest.fn();

    const { fixture } = await render(LoadFeedbackComponent, {
      inputs: {
        message: 'No hemos podido actualizar la vista.',
        retryLabel: 'Volver a intentar',
        tone: 'error',
      },
      on: {
        retry: onRetry,
      },
    });

    expect(screen.getByText(/No hemos podido actualizar la vista/i)).toBeVisible();
    expect(fixture.nativeElement).toHaveClass('load-feedback--error');

    await fireEvent.click(screen.getByRole('button', { name: /Volver a intentar/i }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('has no accessibility violations in warning mode', async () => {
    const { container } = await render(LoadFeedbackComponent, {
      inputs: {
        message: 'Mostramos el ultimo contenido valido mientras actualizamos.',
        tone: 'warning',
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
