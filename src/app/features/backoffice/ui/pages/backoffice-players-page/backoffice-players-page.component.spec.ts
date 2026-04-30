import { signal } from '@angular/core';
import { render, screen, within } from '@testing-library/angular';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficePlayersPageComponent } from './backoffice-players-page.component';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';

describe('BackofficePlayersPageComponent', () => {
  it('shows the admin edit action and opens the limited edit dialog', async () => {
    const playersStore = {
      players: signal([
        {
          id: 'player-1',
          firstName: 'Adri',
          lastName: 'Alvarez',
          alias: 'Magic',
          email: 'adri@example.com',
          profileImage: null,
          isPresident: false,
          teamId: 'team-1',
          value: 10,
          totalPoints: 0,
          wonGames: 2,
          lostGames: 1,
          preferredPosition: 'right' as const,
          description: 'Jugador',
          instagramUrl: 'https://instagram.com/adri',
        },
      ]),
      isLoading: signal(false),
      isSaving: signal(false),
      errorMessage: signal<string | null>(null),
      hasContent: signal(true),
      load: jest.fn().mockResolvedValue(undefined),
      update: jest.fn().mockResolvedValue(undefined),
      playerById: jest.fn((playerId: string) =>
        playerId === 'player-1'
          ? {
              id: 'player-1',
              firstName: 'Adri',
              lastName: 'Alvarez',
              alias: 'Magic',
              email: 'adri@example.com',
              profileImage: null,
              isPresident: false,
              teamId: 'team-1',
              value: 10,
              totalPoints: 0,
              wonGames: 2,
              lostGames: 1,
              preferredPosition: 'right' as const,
              description: 'Jugador',
              instagramUrl: 'https://instagram.com/adri',
            }
          : null,
      ),
      buildCards: jest.fn().mockReturnValue([
        {
          id: 'player-1',
          title: 'Adri Alvarez',
          nickLabel: '"Magic"',
          statusLabel: 'Asignado',
          statusTone: 'success',
          derivedTeamLabel: 'Equipo: Kings Of Favar',
          matchRecordLabel: '2V · 1D',
          wonGames: 2,
          lostGames: 1,
          userLinkageLabel: 'Correo: adri@example.com',
          detailPath: '/backoffice/jugadores/player-1',
        },
      ]),
    } satisfies Pick<
      BackofficePlayersStore,
      | 'players'
      | 'isLoading'
      | 'isSaving'
      | 'errorMessage'
      | 'hasContent'
      | 'load'
      | 'update'
      | 'playerById'
      | 'buildCards'
    >;

    await render(BackofficePlayersPageComponent, {
      providers: [
        { provide: BackofficePlayersStore, useValue: playersStore },
        {
          provide: BackofficeTeamsStore,
          useValue: {
            teams: signal([
              {
                id: 'team-1',
                name: 'Kings Of Favar',
                description: 'Equipo',
                secondaryDescription: 'Equipo',
                logo: null,
              },
            ]),
            isLoading: signal(false),
            errorMessage: signal<string | null>(null),
            hasContent: signal(true),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('ADMIN'),
          },
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    expect(screen.getByText('Estado actual del modulo')).toBeVisible();
    expect(
      screen.getByText(
        'Edicion limitada disponible: alias, nombre, apellidos, posicion, Instagram e imagen.',
      ),
    ).toBeVisible();

    const row = screen.getByText('Adri Alvarez').closest('.players-table__row');
    expect(row).not.toBeNull();
    expect(within(row as HTMLElement).getByRole('button', { name: 'Editar ficha' })).toBeVisible();

    within(row as HTMLElement)
      .getByRole('button', { name: 'Editar ficha' })
      .click();

    expect(await screen.findByRole('heading', { name: 'Editar jugador' })).toBeVisible();
    expect(
      screen.getByText(
        'Solo se guardan alias, nombre, apellidos, posicion preferida, Instagram e imagen.',
      ),
    ).toBeVisible();
    screen.getByRole('button', { name: 'Siguiente →' }).click();
    await screen.findByRole('button', { name: 'Guardar cambios' });
    expect(screen.getByDisplayValue('adri@example.com')).toHaveAttribute('readonly');
    expect(screen.getByDisplayValue('Kings Of Favar')).toHaveAttribute('readonly');
    expect(screen.queryByText('Email vinculado')).toBeNull();
  });
});
