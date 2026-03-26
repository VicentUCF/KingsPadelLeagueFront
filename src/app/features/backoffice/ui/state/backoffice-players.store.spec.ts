import { TestBed } from '@angular/core/testing';

import {
  LOAD_BACKOFFICE_PLAYERS_USE_CASE,
  UPDATE_BACKOFFICE_PLAYER_USE_CASE,
} from '../providers/backoffice.providers';
import { BackofficePlayersStore } from './backoffice-players.store';

function createPlayer(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'player-1',
    firstName: 'Adri',
    lastName: 'Alvarez',
    alias: 'Magic',
    email: 'adri@example.com',
    profileImage: null,
    isPresident: false,
    teamId: 'team-1',
    value: 10,
    wonGames: 1,
    lostGames: 0,
    preferredPosition: 'right' as const,
    description: 'Jugador',
    instagramUrl: 'https://instagram.com/adri',
    ...overrides,
  };
}

describe('BackofficePlayersStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('updates a player and refreshes the directory', async () => {
    const loadBackofficePlayersUseCase = {
      execute: jest
        .fn()
        .mockResolvedValueOnce([createPlayer()])
        .mockResolvedValueOnce([createPlayer({ alias: 'Nuevo alias' })]),
    };
    const updateBackofficePlayerUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      providers: [
        BackofficePlayersStore,
        {
          provide: LOAD_BACKOFFICE_PLAYERS_USE_CASE,
          useValue: loadBackofficePlayersUseCase,
        },
        {
          provide: UPDATE_BACKOFFICE_PLAYER_USE_CASE,
          useValue: updateBackofficePlayerUseCase,
        },
      ],
    });

    const store = TestBed.inject(BackofficePlayersStore);

    await store.load();
    await store.update('player-1', {
      alias: 'Nuevo alias',
      firstName: 'Adri',
      lastName: 'Alvarez',
      preferredPosition: 'right',
      instagramUrl: 'https://instagram.com/adri',
      profileImage: '',
    });

    expect(updateBackofficePlayerUseCase.execute).toHaveBeenCalledWith('player-1', {
      alias: 'Nuevo alias',
      firstName: 'Adri',
      lastName: 'Alvarez',
      preferredPosition: 'right',
      instagramUrl: 'https://instagram.com/adri',
      profileImage: '',
    });
    expect(loadBackofficePlayersUseCase.execute).toHaveBeenCalledTimes(2);
    expect(store.players()).toEqual([expect.objectContaining({ alias: 'Nuevo alias' })]);
    expect(store.isSaving()).toBe(false);
  });
});
