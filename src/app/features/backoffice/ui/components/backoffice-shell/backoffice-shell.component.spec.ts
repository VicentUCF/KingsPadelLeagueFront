import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterOutlet, provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { BACKOFFICE_ROUTES } from '../../backoffice.routes';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: '<router-outlet />',
})
class RouterHostComponent {}

describe('BackofficeShellComponent', () => {
  it('renders the full roadmap navigation and dashboard entry', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }])],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    expect(await screen.findByRole('heading', { name: /^Dashboard$/i })).toBeVisible();

    const navigation = screen.getByRole('navigation', { name: /Backoffice/i });

    expect(within(navigation).getByRole('link', { name: /Dashboard/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );
    expect(within(navigation).getByText('Temporadas')).toBeVisible();
    expect(within(navigation).getByText('Equipos')).toBeVisible();
    expect(within(navigation).getByText('Jugadores')).toBeVisible();
    expect(within(navigation).getByText('Plantillas')).toBeVisible();
    expect(within(navigation).getByText('Jornadas')).toBeVisible();
    expect(within(navigation).getByText('Fixtures')).toBeVisible();
    expect(within(navigation).getByText('MVP')).toBeVisible();
    expect(within(navigation).getByText('Usuarios')).toBeVisible();
    expect(within(navigation).getByText('Auditoría')).toBeVisible();
  });

  it('updates dashboard quick actions when the simulated role changes', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }])],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    expect(await screen.findByRole('link', { name: /Gestionar temporadas/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Mi equipo/i })).not.toBeInTheDocument();

    await fireEvent.change(screen.getByLabelText(/Rol simulado/i), {
      target: { value: 'PRESIDENT' },
    });
    fixture.detectChanges();

    expect(await screen.findByText('PRESIDENT')).toBeVisible();
    expect(screen.getByRole('link', { name: /Mi equipo/i })).toBeVisible();
    expect(screen.queryByRole('link', { name: /Gestionar temporadas/i })).not.toBeInTheDocument();
  });

  it('redirects unauthorized routes back to the backoffice dashboard', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }])],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    await fireEvent.change(screen.getByLabelText(/Rol simulado/i), {
      target: { value: 'PRESIDENT' },
    });
    fixture.detectChanges();

    await router.navigateByUrl('/backoffice/usuarios');
    fixture.detectChanges();

    expect(router.url).toBe('/backoffice');
    expect(await screen.findByRole('heading', { name: /^Dashboard$/i })).toBeVisible();
  });

  it('reflects page title and breadcrumb on placeholder modules', async () => {
    const { fixture } = await render(RouterHostComponent, {
      providers: [provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }])],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice/temporadas');
    fixture.detectChanges();

    expect(await screen.findByRole('heading', { name: /^Temporadas$/i })).toBeVisible();

    const breadcrumb = screen.getByRole('navigation', { name: /Breadcrumb/i });

    expect(within(breadcrumb).getByRole('link', { name: /Backoffice/i })).toHaveAttribute(
      'href',
      '/backoffice',
    );
    expect(within(breadcrumb).getByText('Temporadas')).toBeVisible();
  });

  it('has no accessibility violations in the backoffice shell', async () => {
    const { container, fixture } = await render(RouterHostComponent, {
      providers: [provideRouter([{ path: 'backoffice', children: BACKOFFICE_ROUTES }])],
    });

    const router = fixture.componentRef.injector.get(Router);

    await router.navigateByUrl('/backoffice');
    fixture.detectChanges();

    await screen.findByRole('heading', { name: /^Dashboard$/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
