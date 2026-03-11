import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, within } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { provideBackofficeSeasonsFeature } from '../../providers/backoffice-seasons.providers';
import { BackofficeSeasonsPageComponent } from './backoffice-seasons-page.component';

describe('BackofficeSeasonsPageComponent', () => {
  it('renders the seasons list with the active season highlighted', async () => {
    await render(BackofficeSeasonsPageComponent, {
      providers: [provideBackofficeSeasonsFeature(), provideRouter([])],
    });

    expect(await screen.findByRole('heading', { name: /Listado de seasons/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Crear season/i })).toBeEnabled();

    const activeSeasonCard = await screen.findByRole('article', { name: /Temporada 2026/i });

    expect(within(activeSeasonCard).getByText('Activa')).toBeVisible();
    expect(within(activeSeasonCard).getByText('Única season activa')).toBeVisible();
    expect(within(activeSeasonCard).getByRole('link', { name: /Ver detalle/i })).toHaveAttribute(
      'href',
      '/backoffice/temporadas/season-2026',
    );

    expect(screen.getByRole('article', { name: /Temporada 2027/i })).toBeVisible();
    expect(screen.getByRole('article', { name: /Temporada 2025/i })).toBeVisible();
  });

  it('opens the creation wizard from the seasons list', async () => {
    const { fixture } = await render(BackofficeSeasonsPageComponent, {
      providers: [provideBackofficeSeasonsFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Listado de seasons/i });

    await fireEvent.click(screen.getByRole('button', { name: /Crear season/i }));
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Crear season/i })).toBeVisible();
    expect(screen.getByText(/Completa la configuración base de la season/i)).toBeVisible();
  });

  it('has no accessibility violations in the seasons list', async () => {
    const { container } = await render(BackofficeSeasonsPageComponent, {
      providers: [provideBackofficeSeasonsFeature(), provideRouter([])],
    });

    await screen.findByRole('heading', { name: /Listado de seasons/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
