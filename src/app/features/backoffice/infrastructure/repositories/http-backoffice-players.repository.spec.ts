import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { AuthStore } from '@features/auth/ui/state/auth.store';

import { HttpBackofficePlayersRepository } from './http-backoffice-players.repository';

describe('HttpBackofficePlayersRepository', () => {
  let repository: HttpBackofficePlayersRepository;
  let httpTestingController: HttpTestingController;
  let currentRole: ReturnType<typeof signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>>;

  beforeEach(() => {
    currentRole = signal<'ADMIN' | 'PRESIDENT' | 'PLAYER'>('PLAYER');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        {
          provide: AuthStore,
          useValue: {
            currentRole: computed(() => currentRole()),
          },
        },
        HttpBackofficePlayersRepository,
      ],
    });

    repository = TestBed.inject(HttpBackofficePlayersRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('normalizes missing competitive stats from the backend contract', async () => {
    currentRole.set('PLAYER');

    const playersPromise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/v1/players?limit=200').flush({
      items: [
        createPlayerHttp({
          id: 'player-ruben',
          firstName: 'Ruben',
          lastName: 'Marzal',
          wonGames: undefined,
          lostGames: undefined,
          value: undefined,
        }),
      ],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toEqual([
      expect.objectContaining({
        id: 'player-ruben',
        wonGames: 0,
        lostGames: 0,
        value: 0,
      }),
    ]);
  });

  it('uses /admin/v1 for admin reads', async () => {
    currentRole.set('ADMIN');

    const playersPromise = repository.loadAll();

    httpTestingController.expectOne('http://api.test/admin/v1/players?limit=200').flush({
      items: [createPlayerHttp({ id: 'player-admin' })],
      meta: createMeta(1),
    });

    await expect(playersPromise).resolves.toHaveLength(1);
  });
});

function createMeta(itemCount: number) {
  return {
    currentPage: 1,
    itemCount,
    itemsPerPage: itemCount,
    totalItems: itemCount,
    totalPages: 1,
  };
}

function createPlayerHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'player-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    firstName: 'Jugador',
    lastName: 'Demo',
    email: 'demo@example.com',
    description: 'Perfil oficial',
    profileImage: 'https://cdn.test/player.png',
    isPresident: false,
    value: 0,
    wonGames: 0,
    lostGames: 0,
    preferredPosition: 'right',
    ...overrides,
  };
}
