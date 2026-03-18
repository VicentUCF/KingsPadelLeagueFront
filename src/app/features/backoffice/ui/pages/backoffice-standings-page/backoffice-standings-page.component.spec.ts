import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';

import { BackofficeStandingsStore } from '../../state/backoffice-standings.store';
import { BackofficeStandingsPageComponent } from './backoffice-standings-page.component';

describe('BackofficeStandingsPageComponent', () => {
  it('renders the standings table without draw and form columns', async () => {
    const load = jest.fn().mockResolvedValue(undefined);

    await render(BackofficeStandingsPageComponent, {
      providers: [
        {
          provide: BackofficeStandingsStore,
          useValue: {
            rows: signal([
              {
                rank: 1,
                teamId: 'alpha',
                teamName: 'Alpha',
                teamLogo: null,
                played: 1,
                won: 1,
                lost: 0,
                wonGames: 29,
                lostGames: 21,
                gamesDiff: 8,
                points: 3,
                form: [],
              },
            ]),
            isLoading: signal(false),
            errorMessage: signal<string | null>(null),
            hasContent: signal(true),
            finishedMatchdayCount: signal(1),
            currentMatchday: signal({ name: 'Jornada 2' }),
            load,
          },
        },
      ],
    });

    expect(load).toHaveBeenCalled();
    expect(screen.getByRole('columnheader', { name: 'JG' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'JP' })).toBeVisible();
    expect(screen.getByRole('columnheader', { name: 'DIF' })).toBeVisible();
    expect(screen.queryByTitle('Empates')).toBeNull();
    expect(screen.queryByRole('columnheader', { name: 'Forma' })).toBeNull();
    expect(screen.queryByText('E — Empatados')).toBeNull();
    expect(screen.queryByText('JG — Juegos ganados')).toBeVisible();
    expect(screen.queryByText('JP — Juegos perdidos')).toBeVisible();
  });
});
