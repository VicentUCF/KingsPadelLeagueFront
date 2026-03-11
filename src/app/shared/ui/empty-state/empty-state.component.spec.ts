import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';
import { CalendarDays, Shield, Users } from 'lucide-angular';

import { EmptyStateComponent } from './empty-state.component';

describe('EmptyStateComponent', () => {
  it('renders the featured layout with highlights and internal actions', async () => {
    const { fixture } = await render(EmptyStateComponent, {
      providers: [provideRouter([])],
      inputs: {
        layout: 'feature',
        eyebrow: 'Calendario oficial',
        icon: CalendarDays,
        title: 'Calendario de pádel en preparación',
        description:
          'Publicaremos aquí las jornadas, horarios y cruces oficiales de KingsPadelLeague.',
        highlights: ['Jornadas completas', 'Cruces por equipo', 'Horarios oficiales'],
        actions: [
          {
            label: 'Ver equipos',
            href: '/equipos',
            tone: 'primary',
            icon: Shield,
          },
          {
            label: 'Explorar jugadores',
            href: '/jugadores',
            tone: 'secondary',
            icon: Users,
          },
        ],
      },
    });

    expect(screen.getByText('Calendario oficial')).toBeVisible();
    expect(
      screen.getByRole('heading', { name: /Calendario de pádel en preparación/i }),
    ).toBeVisible();
    expect(screen.getByText('Jornadas completas')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver equipos/i })).toHaveAttribute('href', '/equipos');
    expect(screen.getByRole('link', { name: /Explorar jugadores/i })).toHaveAttribute(
      'href',
      '/jugadores',
    );
    expect(fixture.nativeElement).toHaveClass('empty-state--feature');
    expect(fixture.nativeElement).toHaveClass('empty-state--with-actions');
    expect(fixture.nativeElement).toHaveClass('empty-state--with-highlights');
  });

  it('has no accessibility violations in the featured layout', async () => {
    const { container } = await render(EmptyStateComponent, {
      providers: [provideRouter([])],
      inputs: {
        layout: 'feature',
        eyebrow: 'Resultados oficiales',
        icon: CalendarDays,
        title: 'Resultados y marcadores de la liga',
        description:
          'Mostraremos aquí los resultados de pádel y los resúmenes de cada jornada publicada.',
      },
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
