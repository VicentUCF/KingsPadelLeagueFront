import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import type { AuthRole } from '../../domain/entities/auth-user';
import { SupabaseAuthRepository } from './supabase-auth.repository';

interface SupabaseUserMock {
  readonly app_metadata?: Record<string, unknown>;
  readonly email: string | null;
  readonly id: string;
  readonly role?: string;
  readonly user_metadata: Record<string, unknown>;
}

function buildSupabaseUser(role: unknown, appRole?: unknown): SupabaseUserMock {
  return {
    app_metadata:
      appRole === undefined
        ? {}
        : {
            role: appRole,
            team_id: 'team-1',
          },
    email: 'user@test.com',
    id: 'user-1',
    role: 'authenticated',
    user_metadata: {
      display_name: 'Ana Perez',
      role,
      team_id: 'team-1',
    },
  };
}

function createSupabaseClientMock() {
  const auth = {
    getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
    resetPasswordForEmail: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    signUp: jest.fn().mockResolvedValue({ error: null }),
    updateUser: jest.fn(),
  };

  return {
    auth,
    client: { auth } as unknown as SupabaseClient,
  };
}

describe('SupabaseAuthRepository', () => {
  let repository: SupabaseAuthRepository;
  let supabaseAuth: ReturnType<typeof createSupabaseClientMock>['auth'];

  beforeEach(() => {
    const { auth, client } = createSupabaseClientMock();
    supabaseAuth = auth;

    TestBed.configureTestingModule({
      providers: [SupabaseAuthRepository, { provide: SUPABASE_CLIENT, useValue: client }],
    });

    repository = TestBed.inject(SupabaseAuthRepository);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('registers new accounts with the user role in lowercase', async () => {
    await repository.register({
      displayName: 'Ana Perez',
      email: 'ana@test.com',
      password: 'password123',
    });

    expect(supabaseAuth.signUp).toHaveBeenCalledWith({
      email: 'ana@test.com',
      password: 'password123',
      options: {
        data: {
          display_name: 'Ana Perez',
          role: 'user',
        },
      },
    });
  });

  it.each<[unknown, AuthRole]>([
    ['admin', 'ADMIN'],
    ['president', 'PRESIDENT'],
    ['user', 'USER'],
    ['player', 'PLAYER'],
  ])('normalizes the %s role returned by Supabase metadata into %s', async (role, expected) => {
    supabaseAuth.getUser.mockResolvedValueOnce({ data: { user: buildSupabaseUser(role) } });

    await expect(repository.getCurrentUser()).resolves.toMatchObject({ role: expected });
  });

  it('falls back to USER when Supabase metadata contains an unsupported role', async () => {
    supabaseAuth.getUser.mockResolvedValueOnce({ data: { user: buildSupabaseUser('UNKNOWN') } });

    await expect(repository.getCurrentUser()).resolves.toMatchObject({ role: 'USER' });
  });

  it('prefers the role provided through app_metadata', async () => {
    supabaseAuth.getUser.mockResolvedValueOnce({
      data: { user: buildSupabaseUser('user', 'president') },
    });

    await expect(repository.getCurrentUser()).resolves.toMatchObject({
      role: 'PRESIDENT',
      teamId: 'team-1',
    });
  });
});
