import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { BACKOFFICE_ROUTES } from '@features/backoffice/ui/backoffice.routes';
import { AppShellComponent } from '@layout/app-shell/app-shell.component';
import { AppComponent } from './app.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Contenido público</p>',
})
class DummyPublicRouteComponent {}

function makeAuthStoreMock(
  role: AuthRole | null = null,
  isAuthenticated = false,
): Pick<
  AuthStore,
  | 'accessToken'
  | 'clearError'
  | 'currentRole'
  | 'ensureInitialized'
  | 'error'
  | 'isAuthenticated'
  | 'isLoading'
  | 'login'
  | 'logout'
  | 'register'
  | 'requestPasswordReset'
  | 'resetPassword'
  | 'status'
  | 'user'
> {
  const user =
    isAuthenticated && role
      ? {
          id: '1',
          email: 'ana@test.com',
          displayName: 'Ana Perez',
          role,
          teamId: role === 'PRESIDENT' || role === 'PLAYER' ? 'team-1' : null,
        }
      : null;

  return {
    accessToken: signal(isAuthenticated ? 'mock-token' : null),
    clearError: () => {},
    currentRole: signal<AuthRole | null>(role),
    ensureInitialized: jest.fn().mockResolvedValue(undefined),
    error: signal(null),
    isAuthenticated: signal(isAuthenticated),
    isLoading: signal(false),
    login: async () => {},
    logout: async () => {},
    register: async () => {},
    requestPasswordReset: async () => {},
    resetPassword: async () => {},
    status: signal(isAuthenticated ? 'authenticated' : 'unauthenticated'),
    user: signal(user),
  };
}

describe('AppComponent', () => {
  it('renders the public shell on the site root', async () => {
    const { fixture } = await render(AppComponent, {
      providers: [
        provideRouter([
          {
            path: 'backoffice',
            children: BACKOFFICE_ROUTES,
          },
          {
            path: '',
            component: AppShellComponent,
            children: [
              {
                path: '',
                component: DummyPublicRouteComponent,
              },
            ],
          },
        ]),
        { provide: AuthStore, useValue: makeAuthStoreMock() },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/');
    fixture.detectChanges();

    expect(await screen.findByRole('link', { name: /KingsPadelLeague/i })).toBeVisible();
    expect(screen.queryByRole('heading', { name: /^Dashboard$/i })).not.toBeInTheDocument();
  });

  it('renders the backoffice shell on the backoffice entry route', async () => {
    const { fixture } = await render(AppComponent, {
      providers: [
        provideRouter([
          {
            path: 'backoffice',
            children: BACKOFFICE_ROUTES,
          },
          {
            path: '',
            component: AppShellComponent,
            children: [
              {
                path: '',
                component: DummyPublicRouteComponent,
              },
            ],
          },
        ]),
        { provide: AuthStore, useValue: makeAuthStoreMock('ADMIN', true) },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    expect(await screen.findByRole('heading', { name: /^Dashboard$/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /KingsPadelLeague/i })).not.toBeInTheDocument();
  });
});
