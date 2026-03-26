import { fireEvent, render, screen } from '@testing-library/angular';

import { BackofficeMatchdayFormDialogComponent } from './backoffice-matchday-form-dialog.component';

describe('BackofficeMatchdayFormDialogComponent', () => {
  it('submits only the matchday name and scheduled date', async () => {
    const onSubmitted = jest.fn();

    await render(BackofficeMatchdayFormDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialValue: {
          name: '',
          scheduledAt: '',
        },
      },
      on: {
        submitted: onSubmitted,
      },
    });

    await fireEvent.input(screen.getByLabelText(/Nombre/i), {
      target: { value: 'Jornada 9' },
    });
    await fireEvent.input(screen.getByLabelText(/Fecha y hora/i), {
      target: { value: '2026-04-01T18:00' },
    });
    await fireEvent.click(screen.getByRole('button', { name: /Crear jornada/i }));

    expect(screen.queryByLabelText(/Temporada/i)).not.toBeInTheDocument();
    expect(onSubmitted).toHaveBeenCalledWith({
      name: 'Jornada 9',
      scheduledAt: '2026-04-01T18:00',
    });
  });
});
