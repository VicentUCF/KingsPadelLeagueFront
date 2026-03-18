import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { backofficeAccessGuard } from './backoffice-access.guard';

function makeAuthStoreMock(isAuthenticated: boolean, role: AuthRole | null) {
  return {
    currentRole: signal<AuthRole | null>(role),
    ensureInitialized: jest.fn().mockResolvedValue(undefined),
    isAuthenticated: signal(isAuthenticated),
  } satisfies Pick<AuthStore, 'currentRole' | 'ensureInitialized' | 'isAuthenticated'>;
}

async function runGuard(
  isAuthenticated: boolean,
  role: AuthRole | null,
  ensureInitialized: () => Promise<void> = async () => undefined,
) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      {
        provide: AuthStore,
        useValue: {
          ...makeAuthStoreMock(isAuthenticated, role),
          ensureInitialized,
        },
      },
    ],
  });

  const router = TestBed.inject(Router);
  const result = await TestBed.runInInjectionContext(() => backofficeAccessGuard({} as never, []));

  return { result, router };
}

function expectRedirect(result: unknown, router: Router, expectedUrl: string): void {
  expect(result).not.toBe(true);
  expect(router.serializeUrl(result as UrlTree)).toBe(expectedUrl);
}

describe('backofficeAccessGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects unauthenticated users to login', async () => {
    const { result, router } = await runGuard(false, null);

    expectRedirect(result, router, '/auth/login');
  });

  it('redirects USER accounts to profile', async () => {
    const { result, router } = await runGuard(true, 'USER');

    expectRedirect(result, router, '/perfil');
  });

  it('allows PLAYER accounts into backoffice', async () => {
    const { result } = await runGuard(true, 'PLAYER');

    expect(result).toBe(true);
  });

  it('allows PRESIDENT accounts into backoffice', async () => {
    const { result } = await runGuard(true, 'PRESIDENT');

    expect(result).toBe(true);
  });

  it('allows ADMIN accounts into backoffice', async () => {
    const { result } = await runGuard(true, 'ADMIN');

    expect(result).toBe(true);
  });

  it('waits for auth initialization before resolving the guard', async () => {
    let resolveInitialization: (() => void) | undefined;
    const ensureInitialized = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInitialization = resolve;
        }),
    );

    const resultPromise = runGuard(true, 'ADMIN', ensureInitialized);
    await Promise.resolve();

    expect(ensureInitialized).toHaveBeenCalledTimes(1);

    resolveInitialization?.();

    const { result } = await resultPromise;
    expect(result).toBe(true);
  });
});
