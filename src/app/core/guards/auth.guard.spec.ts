import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { authGuard } from './auth.guard';

function makeAuthStoreMock(
  isAuthenticated: boolean,
  role: AuthRole | null,
  ensureInitialized: () => Promise<void> = async () => undefined,
) {
  return {
    currentRole: signal<AuthRole | null>(role),
    ensureInitialized,
    isAuthenticated: signal(isAuthenticated),
  } satisfies Pick<AuthStore, 'currentRole' | 'ensureInitialized' | 'isAuthenticated'>;
}

async function runGuard(
  isAuthenticated: boolean,
  role: AuthRole | null,
  ensureInitialized?: () => Promise<void>,
) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthStore, useValue: makeAuthStoreMock(isAuthenticated, role, ensureInitialized) },
    ],
  });

  const router = TestBed.inject(Router);
  const result = await TestBed.runInInjectionContext(() => authGuard({} as never, []));

  return { result, router };
}

function expectRedirect(result: unknown, router: Router, expectedUrl: string): void {
  expect(result).not.toBe(true);
  expect(router.serializeUrl(result as UrlTree)).toBe(expectedUrl);
}

describe('authGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects unauthenticated users to login', async () => {
    const { result, router } = await runGuard(false, null);

    expectRedirect(result, router, '/auth/login');
  });

  it('allows authenticated users to enter the profile area', async () => {
    const { result } = await runGuard(true, 'USER');

    expect(result).toBe(true);
  });

  it('waits for the auth store initialization before deciding', async () => {
    let resolveInitialization: (() => void) | undefined;
    const ensureInitialized = jest.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveInitialization = resolve;
        }),
    );

    const resultPromise = runGuard(true, 'USER', ensureInitialized);
    await Promise.resolve();

    expect(ensureInitialized).toHaveBeenCalledTimes(1);

    resolveInitialization?.();

    const { result } = await resultPromise;
    expect(result).toBe(true);
  });
});
