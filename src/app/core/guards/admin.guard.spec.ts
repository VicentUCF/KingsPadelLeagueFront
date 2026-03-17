import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { backofficeAdminGuard } from './admin.guard';

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
  const result = TestBed.runInInjectionContext(() => backofficeAdminGuard({} as never, []));

  return { result, router };
}

function expectRedirect(result: unknown, router: Router, expectedUrl: string): void {
  expect(result).not.toBe(true);
  expect(router.serializeUrl(result as UrlTree)).toBe(expectedUrl);
}

describe('backofficeAdminGuard', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('redirects unauthenticated users to login', () => {
    const { result, router } = runGuard(false, null);

    expectRedirect(result, router, '/auth/login');
  });

  it('redirects USER accounts to profile', () => {
    const { result, router } = runGuard(true, 'USER');

    expectRedirect(result, router, '/perfil');
  });

  it('redirects PLAYER accounts to the backoffice home', () => {
    const { result, router } = runGuard(true, 'PLAYER');

    expectRedirect(result, router, '/backoffice');
  });

  it('redirects PRESIDENT accounts to the backoffice home', () => {
    const { result, router } = runGuard(true, 'PRESIDENT');

    expectRedirect(result, router, '/backoffice');
  });

  it('allows ADMIN accounts into admin-only backoffice sections', () => {
    const { result } = runGuard(true, 'ADMIN');

    expect(result).toBe(true);
  });
});
