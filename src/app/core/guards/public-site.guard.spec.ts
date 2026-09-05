import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree, provideRouter } from '@angular/router';

import { AuthStore } from '@features/auth/ui/state/auth.store';
import { environment } from '../../../environments/environment';
import { publicSiteGuard } from './public-site.guard';

function makeAuthStoreMock(isAuthenticated: boolean) {
  return {
    ensureInitialized: jest.fn().mockResolvedValue(undefined),
    isAuthenticated: signal(isAuthenticated),
  } satisfies Pick<AuthStore, 'ensureInitialized' | 'isAuthenticated'>;
}

async function runGuard(isAuthenticated: boolean) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([]),
      { provide: AuthStore, useValue: makeAuthStoreMock(isAuthenticated) },
    ],
  });

  const router = TestBed.inject(Router);
  const result = await TestBed.runInInjectionContext(() => publicSiteGuard({} as never, []));

  return { result, router };
}

function expectRedirect(result: unknown, router: Router, expectedUrl: string): void {
  expect(result).not.toBe(true);
  expect(router.serializeUrl(result as UrlTree)).toBe(expectedUrl);
}

describe('publicSiteGuard', () => {
  const originalPublicSiteEnabled = environment.publicSiteEnabled;

  afterEach(() => {
    TestBed.resetTestingModule();
    environment.publicSiteEnabled = originalPublicSiteEnabled;
  });

  it('allows access when the public site flag is enabled, regardless of auth state', async () => {
    environment.publicSiteEnabled = true;

    const { result } = await runGuard(false);

    expect(result).toBe(true);
  });

  it('redirects unauthenticated users to login when the public site flag is disabled', async () => {
    environment.publicSiteEnabled = false;

    const { result, router } = await runGuard(false);

    expectRedirect(result, router, '/auth/login');
  });

  it('redirects authenticated users to the backoffice when the public site flag is disabled', async () => {
    environment.publicSiteEnabled = false;

    const { result, router } = await runGuard(true);

    expectRedirect(result, router, '/backoffice');
  });
});
