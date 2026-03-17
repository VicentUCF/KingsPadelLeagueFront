import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { noAuthGuard } from './no-auth.guard';

function makeAuthStoreMock(isAuthenticated: boolean, role: AuthRole | null) {
  return {
    currentRole: signal<AuthRole | null>(role),
    isAuthenticated: signal(isAuthenticated),
  } satisfies Pick<AuthStore, 'currentRole' | 'isAuthenticated'>;
}

function runGuard(isAuthenticated: boolean, role: AuthRole | null) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthStore, useValue: makeAuthStoreMock(isAuthenticated, role) },
    ],
  });

  const router = TestBed.inject(Router);
  const result = TestBed.runInInjectionContext(() => noAuthGuard({} as never, []));

  return { result, router };
}

function expectRedirect(result: unknown, router: Router, expectedUrl: string): void {
  expect(result).not.toBe(true);
  expect(router.serializeUrl(result as UrlTree)).toBe(expectedUrl);
}

describe('noAuthGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('allows unauthenticated users to enter auth routes', () => {
    const { result } = runGuard(false, null);

    expect(result).toBe(true);
  });

  it('redirects USER accounts to profile', () => {
    const { result, router } = runGuard(true, 'USER');

    expectRedirect(result, router, '/perfil');
  });

  it('redirects PRESIDENT accounts to backoffice', () => {
    const { result, router } = runGuard(true, 'PRESIDENT');

    expectRedirect(result, router, '/backoffice');
  });

  it('redirects ADMIN accounts to backoffice', () => {
    const { result, router } = runGuard(true, 'ADMIN');

    expectRedirect(result, router, '/backoffice');
  });
});
