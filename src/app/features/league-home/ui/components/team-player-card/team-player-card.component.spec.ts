import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { TeamPlayerCardComponent } from './team-player-card.component';

describe('TeamPlayerCardComponent', () => {
  it('renders a fallback icon when the roster player has no photo yet', async () => {
    const { container } = await render(TeamPlayerCardComponent, {
      providers: [provideRouter([])],
      inputs: {
        player: {
          id: 'tit-1',
          profileLink: '/jugadores/marco-vidal',
          displayName: 'Marco Vidal',
          roleLabel: 'Drive',
          photoPath: null,
          photoAlt: '',
        },
      },
    });

    expect(screen.getByRole('heading', { name: /Marco Vidal/i })).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver perfil de Marco Vidal/i })).toHaveAttribute(
      'href',
      '/jugadores/marco-vidal',
    );
    expect(container.querySelector('.team-player-card__photo')).toBeNull();
    expect(container.querySelector('.team-player-card__photo-fallback')).not.toBeNull();
  });
});
