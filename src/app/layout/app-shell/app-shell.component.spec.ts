import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import { AppShellComponent } from './app-shell.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Contenido de prueba</p>',
})
class DummyRouteComponent {}

function makeAuthStoreMock(
  role: AuthRole | null = null,
  isAuthenticated = false,
): Pick<
  AuthStore,
  | 'accessToken'
  | 'clearError'
  | 'currentRole'
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

async function renderAppShell(
  authStore: ReturnType<typeof makeAuthStoreMock> = makeAuthStoreMock(),
) {
  return render(AppShellComponent, {
    providers: [
      provideRouter([
        {
          path: '',
          component: DummyRouteComponent,
        },
        {
          path: 'equipos/:slug',
          component: DummyRouteComponent,
        },
        {
          path: 'perfil',
          component: DummyRouteComponent,
        },
        {
          path: 'backoffice',
          component: DummyRouteComponent,
        },
      ]),
      { provide: AuthStore, useValue: authStore },
    ],
  });
}

describe('AppShellComponent', () => {
  it('toggles the navigation drawer from the menu button', async () => {
    await renderAppShell();

    const menuButton = screen.getByRole('button', { name: /Abrir o cerrar navegación/i });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');

    await fireEvent.click(menuButton);

    expect(menuButton).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(screen.getByRole('navigation', { name: /Principal/i })).getByRole('link', {
        name: /Clasificación/i,
      }),
    ).toBeVisible();
  });

  it('closes the navigation drawer when Escape is pressed inside the menu', async () => {
    await renderAppShell();

    const menuButton = screen.getByRole('button', { name: /Abrir o cerrar navegación/i });
    await fireEvent.click(menuButton);
    expect(menuButton).toHaveAttribute('aria-expanded', 'true');

    await fireEvent.keyDown(document, { key: 'Escape' });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no accessibility violations in the application shell', async () => {
    const { container } = await renderAppShell();

    expect(await axe(container)).toHaveNoViolations();
  });

  it('keeps Equipos navigation active for nested team routes', async () => {
    const { fixture } = await renderAppShell();

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/equipos/titanics');
    fixture.detectChanges();

    expect(
      within(screen.getByRole('navigation', { name: /Principal/i })).getByRole('link', {
        name: /^Equipos$/i,
      }),
    ).toHaveClass('app-shell__nav-link--active');
  });

  it('hides the backoffice link for authenticated USER accounts', async () => {
    await renderAppShell(makeAuthStoreMock('USER', true));

    await fireEvent.click(screen.getByRole('button', { name: /Ana Perez/i }));

    const navigation = screen.getByRole('navigation', { name: /Principal/i });
    const userMenu = screen.getByRole('menu');

    expect(within(navigation).queryByRole('link', { name: /Backoffice/i })).toBeNull();
    expect(within(navigation).queryByRole('link', { name: /Mi equipo/i })).toBeNull();
    expect(within(userMenu).queryByRole('menuitem', { name: /Backoffice/i })).toBeNull();
    expect(within(userMenu).queryByRole('menuitem', { name: /Mi equipo/i })).toBeNull();
  });

  it('shows the Mi equipo shortcut in the primary navigation for PRESIDENT accounts', async () => {
    await renderAppShell(makeAuthStoreMock('PRESIDENT', true));

    const navigation = screen.getByRole('navigation', { name: /Principal/i });

    expect(within(navigation).getByRole('link', { name: /Mi equipo/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );

    await fireEvent.click(screen.getByRole('button', { name: /Ana Perez/i }));

    expect(
      within(screen.getByRole('menu')).queryByRole('menuitem', { name: /Mi equipo/i }),
    ).toBeNull();
  });

  it('shows the Mi equipo shortcut in the primary navigation for PLAYER accounts', async () => {
    await renderAppShell(makeAuthStoreMock('PLAYER', true));

    const navigation = screen.getByRole('navigation', { name: /Principal/i });

    expect(within(navigation).getByRole('link', { name: /Mi equipo/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );

    await fireEvent.click(screen.getByRole('button', { name: /Ana Perez/i }));

    expect(
      within(screen.getByRole('menu')).queryByRole('menuitem', { name: /Mi equipo/i }),
    ).toBeNull();
  });

  it('shows the Panel backoffice shortcut in the primary navigation for ADMIN accounts', async () => {
    await renderAppShell(makeAuthStoreMock('ADMIN', true));

    const navigation = screen.getByRole('navigation', { name: /Principal/i });

    expect(within(navigation).getByRole('link', { name: /Backoffice/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );

    await fireEvent.click(screen.getByRole('button', { name: /Ana Perez/i }));

    expect(
      within(screen.getByRole('menu')).queryByRole('menuitem', { name: /Backoffice/i }),
    ).toBeNull();
  });
});
