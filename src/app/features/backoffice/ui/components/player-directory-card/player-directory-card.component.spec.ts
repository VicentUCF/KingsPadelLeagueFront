import { fireEvent, render, screen } from '@testing-library/angular';

import { PlayerDirectoryCardComponent } from './player-directory-card.component';

describe('PlayerDirectoryCardComponent', () => {
  it('hides linkage and budget details from the backoffice player cards', async () => {
    await render(PlayerDirectoryCardComponent, {
      inputs: {
        player: {
          id: 'player-1',
          title: 'Alex Soler',
          nickLabel: '"Escopeta"',
          statusLabel: 'Asignado',
          statusTone: 'success',
          derivedTeamLabel: 'Equipo: Kings Of Favar',
          matchRecordLabel: '3V · 1D',
          wonGames: 3,
          lostGames: 1,
          userLinkageLabel: 'Cuenta vinculada',
          detailPath: '/backoffice/jugadores/player-1',
        },
      },
    });

    expect(screen.getByText('3V · 1D')).toBeVisible();
    expect(screen.queryByText('Cuenta vinculada')).toBeNull();

    await fireEvent.click(screen.getByRole('button', { name: /Ver ficha/i }));

    expect(screen.queryByText('Valor')).toBeNull();
    expect(screen.queryByText('Vinculación')).toBeNull();
    expect(screen.getByText('Victorias')).toBeVisible();
    expect(screen.getByText('Derrotas')).toBeVisible();
  });
});
