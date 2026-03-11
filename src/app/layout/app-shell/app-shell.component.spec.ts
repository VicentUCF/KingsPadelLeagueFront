import { ChangeDetectionStrategy, Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { AppShellComponent } from './app-shell.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<p>Contenido de prueba</p>',
})
class DummyRouteComponent {}

describe('AppShellComponent', () => {
  it('toggles the navigation drawer from the menu button', async () => {
    await render(AppShellComponent, {
      providers: [
        provideRouter([
          {
            path: '',
            component: DummyRouteComponent,
          },
        ]),
      ],
    });

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

  it('has no accessibility violations in the application shell', async () => {
    const { container } = await render(AppShellComponent, {
      providers: [
        provideRouter([
          {
            path: '',
            component: DummyRouteComponent,
          },
        ]),
      ],
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
