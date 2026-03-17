import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';

import { AuthStore } from '../../state/auth.store';
import { LoginPageComponent } from './login-page.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Home</p>',
})
class DummyRouteComponent {}

function makeAuthStoreMock(): Pick<AuthStore, 'error' | 'isLoading' | 'login'> {
  return {
    error: signal<string | null>(null),
    isLoading: signal(false),
    login: jest.fn().mockResolvedValue(undefined),
  };
}

describe('LoginPageComponent', () => {
  it('redirects to home after a successful login', async () => {
    const authStore = makeAuthStoreMock();
    const { fixture } = await render(LoginPageComponent, {
      providers: [
        provideRouter([{ path: '', component: DummyRouteComponent }]),
        { provide: AuthStore, useValue: authStore },
      ],
    });

    const router = fixture.componentRef.injector.get(Router);
    const navigateSpy = jest.spyOn(router, 'navigate');

    await fireEvent.input(screen.getByLabelText(/Correo electrónico/i), {
      target: { value: 'ana@test.com' },
    });
    await fireEvent.input(screen.getByLabelText(/^Contraseña$/i), {
      target: { value: 'password123' },
    });
    await fireEvent.click(screen.getByRole('button', { name: /Iniciar sesión/i }));

    await waitFor(() => {
      expect(authStore.login).toHaveBeenCalledWith('ana@test.com', 'password123');
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });
});
