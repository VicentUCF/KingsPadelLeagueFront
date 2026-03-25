import { fireEvent, render, screen } from '@testing-library/angular';

import { BackofficePairMatchResultDialogComponent } from './backoffice-pair-match-result-dialog.component';

describe('BackofficePairMatchResultDialogComponent', () => {
  it('prefills existing sets and emits the edited result', async () => {
    const onSubmitted = jest.fn();

    await render(BackofficePairMatchResultDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialSets: [
          { local: 6, away: 4 },
          { local: 4, away: 6 },
        ],
      },
      on: {
        submitted: onSubmitted,
      },
    });

    const localInputs = screen.getAllByLabelText(/Local/i);
    const awayInputs = screen.getAllByLabelText(/Visitante/i);

    expect(localInputs).toHaveLength(2);
    expect(localInputs[0]).toHaveValue(6);
    expect(awayInputs[1]).toHaveValue(6);

    await fireEvent.input(localInputs[1]!, { target: { value: '6' } });
    await fireEvent.input(awayInputs[1]!, { target: { value: '2' } });
    await fireEvent.click(screen.getByRole('button', { name: /Guardar resultado/i }));

    expect(onSubmitted).toHaveBeenCalledWith({
      setsResult: [
        { local: 6, away: 4 },
        { local: 6, away: 2 },
      ],
    });
  });
});
