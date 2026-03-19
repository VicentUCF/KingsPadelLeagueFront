import { TestBed } from '@angular/core/testing';
import type {
  AuthChangeEvent,
  AuthResponse,
  AuthTokenResponsePassword,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import { LoadEditablePlayerProfileUseCase } from '../../application/use-cases/load-editable-player-profile.use-case';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import { UpdateEditablePlayerProfileUseCase } from '../../application/use-cases/update-editable-player-profile.use-case';
import { AuthStore } from './auth.store';

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value: T) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve: ((value: T) => void) | undefined;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve;
  });

  return {
    promise,
    resolve: (value) => resolve?.(value),
  };
}

type AuthStateChangeCallback = (event: AuthChangeEvent, session: Session | null) => void;

interface SupabaseAuthMock {
  getSession: jest.Mock<Promise<{ data: { session: Session | null } }>, []>;
  getUser: jest.Mock<Promise<{ data: { user: User | null } }>, []>;
  onAuthStateChange: jest.Mock<
    { data: { subscription: { unsubscribe: () => void } } },
    [AuthStateChangeCallback]
  >;
  updateUser: jest.Mock<Promise<{ error: null }>, []>;
  signInWithPassword: jest.Mock<Promise<AuthTokenResponsePassword>, []>;
  signUp: jest.Mock<Promise<AuthResponse>, []>;
  signOut: jest.Mock<Promise<{ error: null }>, []>;
  resetPasswordForEmail: jest.Mock<Promise<{ data: object; error: null }>, []>;
}

function createSupabaseClientMock(): {
  readonly auth: SupabaseAuthMock;
  emitAuthStateChange: AuthStateChangeCallback;
} {
  const getSession = jest.fn<Promise<{ data: { session: Session | null } }>, []>();
  const getUser = jest.fn<Promise<{ data: { user: User | null } }>, []>();
  const updateUser = jest.fn().mockResolvedValue({ error: null });
  const signInWithPassword = jest.fn<Promise<AuthTokenResponsePassword>, []>();
  const signUp = jest.fn<Promise<AuthResponse>, []>();
  const signOut = jest.fn().mockResolvedValue({ error: null });
  const resetPasswordForEmail = jest.fn<Promise<{ data: object; error: null }>, []>();

  let onAuthStateChangeCallback: AuthStateChangeCallback | undefined;

  const onAuthStateChange = jest.fn((callback: AuthStateChangeCallback) => {
    onAuthStateChangeCallback = callback;
    return {
      data: {
        subscription: {
          unsubscribe: () => undefined,
        },
      },
    };
  });

  return {
    auth: {
      getSession,
      getUser,
      onAuthStateChange,
      updateUser,
      signInWithPassword,
      signUp,
      signOut,
      resetPasswordForEmail,
    },
    emitAuthStateChange: (event, session) => onAuthStateChangeCallback?.(event, session),
  };
}

function createUseCaseMock() {
  return {
    execute: jest.fn(),
  };
}

function createSupabaseUser(): User {
  return {
    id: 'user-1',
    aud: 'authenticated',
    created_at: '2026-03-19T10:00:00.000Z',
    email: 'admin@example.com',
    app_metadata: { role: 'ADMIN', team_id: 'team-1' },
    user_metadata: { display_name: 'Admin User' },
    role: 'authenticated',
  } as unknown as User;
}

function createSession(): Session {
  return {
    access_token: 'access-token',
  } as Session;
}

describe('AuthStore', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('waits for the initial session user hydration before resolving initialization', async () => {
    const sessionDeferred = createDeferred<{ data: { session: Session | null } }>();
    const userDeferred = createDeferred<{ data: { user: User | null } }>();
    const supabaseClientMock = createSupabaseClientMock();

    supabaseClientMock.auth.getSession.mockReturnValue(sessionDeferred.promise);
    supabaseClientMock.auth.getUser.mockReturnValue(userDeferred.promise);

    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: SUPABASE_CLIENT, useValue: supabaseClientMock as unknown as SupabaseClient },
        { provide: LoginUseCase, useValue: createUseCaseMock() },
        { provide: RegisterUseCase, useValue: createUseCaseMock() },
        { provide: LogoutUseCase, useValue: createUseCaseMock() },
        { provide: RequestPasswordResetUseCase, useValue: createUseCaseMock() },
        { provide: ResetPasswordUseCase, useValue: createUseCaseMock() },
        { provide: LoadEditablePlayerProfileUseCase, useValue: createUseCaseMock() },
        { provide: UpdateEditablePlayerProfileUseCase, useValue: createUseCaseMock() },
      ],
    });

    const store = TestBed.inject(AuthStore);
    let isInitialized = false;

    const initializationPromise = store.ensureInitialized().then(() => {
      isInitialized = true;
    });

    supabaseClientMock.emitAuthStateChange('INITIAL_SESSION', createSession());
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(supabaseClientMock.auth.getUser).toHaveBeenCalledTimes(1);
    expect(isInitialized).toBe(false);
    expect(store.isAuthenticated()).toBe(false);

    userDeferred.resolve({ data: { user: createSupabaseUser() } });
    await initializationPromise;

    expect(isInitialized).toBe(true);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.currentRole()).toBe('ADMIN');
  });
});
