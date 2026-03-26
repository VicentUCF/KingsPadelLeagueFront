import { fireEvent, render, screen, waitFor } from '@testing-library/angular';

import { BackofficeMatchFormDialogComponent } from './backoffice-match-form-dialog.component';

describe('BackofficeMatchFormDialogComponent', () => {
  const teams = [
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
    {
      id: 'team-3',
      name: 'Magic City',
      description: 'Equipo comodin',
      secondaryDescription: 'Third',
      logo: null,
    },
  ] as const;

  it('keeps the opposite select empty when trying to repeat the same team', async () => {
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
        existingMatches: [],
        teams,
      },
      on: {
        submitted: onSubmitted,
      },
    });

    const localTeamSelect = screen.getByLabelText(/Equipo local/i);
    const awayTeamSelect = screen.getByLabelText(/Equipo visitante/i);

    await fireEvent.change(localTeamSelect!, {
      target: { value: 'team-1' },
    });
    await fireEvent.change(awayTeamSelect!, {
      target: { value: 'team-1' },
    });
    expect((awayTeamSelect as HTMLSelectElement).value).toBe('');

    await fireEvent.click(screen.getByRole('button', { name: /Crear partido/i }));

    expect(onSubmitted).not.toHaveBeenCalled();
  });

  it('filters away team options to hide the selected local team and duplicated encounters', async () => {
    await render(BackofficeMatchFormDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialValue: {
          localTeamId: '',
          awayTeamId: '',
          scheduledAt: '2026-03-30T18:00',
        },
        existingMatches: [{ localTeamId: 'team-2', awayTeamId: 'team-1' }],
        teams,
      },
    });

    const localTeamSelect = screen.getByLabelText(/Equipo local/i);
    await fireEvent.change(localTeamSelect, {
      target: { value: 'team-1' },
    });

    const awayTeamSelect = screen.getByLabelText(/Equipo visitante/i) as HTMLSelectElement;
    const awayOptionValues = Array.from(awayTeamSelect.options).map((option) => option.value);

    expect(awayOptionValues).toEqual(['', 'team-3']);
  });

  it('does not keep a conflicting duplicate encounter preselected when the dialog opens', async () => {
    await render(BackofficeMatchFormDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialValue: {
          localTeamId: 'team-1',
          awayTeamId: 'team-2',
          scheduledAt: '2026-03-30T18:00',
        },
        existingMatches: [{ localTeamId: 'team-1', awayTeamId: 'team-2' }],
        teams,
      },
    });

    const localTeamSelect = screen.getByLabelText(/Equipo local/i) as HTMLSelectElement;
    const awayTeamSelect = screen.getByLabelText(/Equipo visitante/i) as HTMLSelectElement;

    await waitFor(() => {
      expect(localTeamSelect.value === '' || awayTeamSelect.value === '').toBe(true);
    });
  });

  it('renders the scheduled date passed as initial value', async () => {
    await render(BackofficeMatchFormDialogComponent, {
      inputs: {
        isOpen: true,
        isSubmitting: false,
        submissionError: null,
        initialValue: {
          localTeamId: '',
          awayTeamId: '',
          scheduledAt: '2026-03-30T18:00',
        },
        existingMatches: [],
        teams,
      },
    });

    expect(screen.getByLabelText(/Fecha y hora/i)).toHaveValue('2026-03-30T18:00');
  });
});
