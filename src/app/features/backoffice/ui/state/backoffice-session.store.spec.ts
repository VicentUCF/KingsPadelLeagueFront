import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import type { AuthUser } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { BackofficePlayersStore } from './backoffice-players.store';
import { BackofficeSessionStore } from './backoffice-session.store';

function createAuthStoreMock(user: AuthUser | null) {
  return {
    currentRole: signal(user?.role ?? null),
    logout: jest.fn().mockResolvedValue(undefined),
    user: signal(user),
  } satisfies Pick<AuthStore, 'currentRole' | 'logout' | 'user'>;
}

function createPlayersStoreMock(players: readonly BackofficePlayer[]) {
  return {
    players: signal(players),
  } satisfies Pick<BackofficePlayersStore, 'players'>;
}

function createPlayer(overrides: Partial<BackofficePlayer> = {}): BackofficePlayer {
  return {
    id: 'player-1',
    firstName: 'Adri',
    lastName: 'Alvarez',
    email: 'adri@example.com',
    profileImage: null,
    isPresident: true,
    teamId: 'team-1',
    value: 0,
    wonGames: 0,
    lostGames: 0,
    preferredPosition: 'both',
    description: 'Description',
    ...overrides,
  };
}

describe('BackofficeSessionStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('uses the teamId from auth metadata when it exists', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'president@example.com',
            displayName: 'President',
            role: 'PRESIDENT',
            teamId: 'team-from-auth',
          }),
        },
        {
          provide: BackofficePlayersStore,
          useValue: createPlayersStoreMock([createPlayer({ teamId: 'team-from-player' })]),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentPresidentTeamId()).toBe('team-from-auth');
  });

  it('falls back to the linked player team when auth metadata has no teamId', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'adri@example.com',
            displayName: 'Adri',
            role: 'PLAYER',
            teamId: null,
          }),
        },
        {
          provide: BackofficePlayersStore,
          useValue: createPlayersStoreMock([
            createPlayer({ email: 'other@example.com', teamId: 'team-other' }),
            createPlayer({ email: 'Adri@Example.com', teamId: 'team-1' }),
          ]),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentPresidentTeamId()).toBe('team-1');
  });

  it('keeps PRESIDENT accounts in the president backoffice role', () => {
    TestBed.configureTestingModule({
      providers: [
        BackofficeSessionStore,
        {
          provide: AuthStore,
          useValue: createAuthStoreMock({
            id: 'user-1',
            email: 'president@example.com',
            displayName: 'President',
            role: 'PRESIDENT',
            teamId: 'team-1',
          }),
        },
        {
          provide: BackofficePlayersStore,
          useValue: createPlayersStoreMock([createPlayer()]),
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });

    const store = TestBed.inject(BackofficeSessionStore);

    expect(store.currentRole()).toBe('PRESIDENT');
  });
});
