import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { LoadingStateComponent } from './loading-state.component';

describe('LoadingStateComponent', () => {
  it('renders the page variant with metrics and card placeholders', async () => {
    const { fixture } = await render(LoadingStateComponent, {
      inputs: {
        variant: 'page',
        heading: 'Cargando clasificacion',
        hint: 'Estamos actualizando la vista de la liga.',
        showMetrics: true,
        cardCount: 2,
      },
    });

    expect(
      screen.getByText('Cargando clasificacion', { selector: '.loading-state__heading' }),
    ).toBeVisible();
    expect(
      screen.getByText(/Estamos actualizando la vista de la liga/i, {
        selector: '.loading-state__hint',
      }),
    ).toBeVisible();
    expect(fixture.nativeElement).toHaveClass('loading-state--page');
    expect(fixture.nativeElement.querySelectorAll('.loading-state__metric')).toHaveLength(3);
    expect(fixture.nativeElement.querySelectorAll('.loading-state__card')).toHaveLength(2);
  });

  it('renders the table variant accessibly', async () => {
    const { container } = await render(LoadingStateComponent, {
      inputs: {
        variant: 'table',
        heading: 'Cargando tabla de usuarios',
        lineCount: 3,
      },
    });

    expect(screen.getByText('Cargando tabla de usuarios')).toBeVisible();
    expect(await axe(container)).toHaveNoViolations();
  });
});
