import { fireEvent, render, screen } from '@testing-library/angular';

import { BackofficeMatchFormDialogComponent } from './backoffice-match-form-dialog.component';

describe('BackofficeMatchFormDialogComponent', () => {
  it('blocks submission when local and away teams are the same', async () => {
    const onSubmitted = jest.fn();

    await render(BackofficeMatchFormDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialValue: {
          localTeamId: '',
          awayTeamId: '',
          scheduledAt: '',
        },
        teams: [
          {
            id: 'team-1',
            name: 'Kings Of Favar',
            description: 'Equipo local',
            secondaryDescription: 'Local',
            logo: null,
          },
          {
            id: 'team-2',
            name: 'Titanics',
            description: 'Equipo visitante',
            secondaryDescription: 'Away',
            logo: null,
          },
        ],
      },
      on: {
        submitted: onSubmitted,
      },
    });

    const [localTeamSelect, awayTeamSelect] = screen.getAllByRole('combobox');

    await fireEvent.change(localTeamSelect!, {
      target: { value: 'team-1' },
    });
    await fireEvent.change(awayTeamSelect!, {
      target: { value: 'team-1' },
    });
    expect(screen.getByText(/Local y visitante deben ser equipos distintos/i)).toBeVisible();
    expect(screen.getByRole('button', { name: /Crear partido/i })).toBeDisabled();

    await fireEvent.click(screen.getByRole('button', { name: /Crear partido/i }));

    expect(onSubmitted).not.toHaveBeenCalled();
  });
});
