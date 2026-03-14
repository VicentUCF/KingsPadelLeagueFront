import { render, screen } from '@testing-library/angular';
import { provideRouter } from '@angular/router';

import { TeamShowcaseHeroComponent } from './team-showcase-hero.component';

describe('TeamShowcaseHeroComponent', () => {
  it('renders roster fallback icons when players do not have uploaded photos', async () => {
    const { container } = await render(TeamShowcaseHeroComponent, {
      providers: [provideRouter([])],
      inputs: {
        team: {
          id: 'titanics',
          slug: 'titanics',
          name: 'Titanics',
          tagline: 'Control glacial y presión constante en cada juego',
          identityDescription: 'Equipo de prueba',
          presidentName: 'Torres',
          logoPath: '/teams_logos/titanics_no_bg.webp',
          monogram: 'TT',
          palette: {
            primary: '#8bd0ff',
            accent: '#d8f2ff',
            surface: '#081824',
            glow: 'rgb(139 208 255 / 0.42)',
            contrast: '#031018',
          },
          playerCountLabel: '6 jugadores en rotación',
          teamLink: '/equipos/titanics',
          pulseLabel: 'Jornada 3 de 5 · Fase regular',
          nextMatchLabel: 'Domingo 18:00 · vs Kings of Favar',
          latestResultLabel: 'Llega tras ganar a Barbaridad por 5-0.',
          facts: [
            { label: 'Presidente', value: 'Torres' },
            { label: 'Plantilla', value: '6 jugadores' },
          ],
          roster: [
            {
              id: 'tit-1',
              displayName: 'Marco Vidal',
              roleLabel: 'Drive',
              photoPath: null,
              photoAlt: '',
            },
            {
              id: 'tit-2',
              displayName: 'Diego Llorens',
              roleLabel: 'Revés',
              photoPath: null,
              photoAlt: '',
            },
            {
              id: 'tit-3',
              displayName: 'Hugo Ferrer',
              roleLabel: 'Finisher',
              photoPath: null,
              photoAlt: '',
            },
          ],
        },
      },
    });

    expect(screen.getByRole('heading', { name: /Titanics/i })).toBeVisible();
    expect(container.querySelectorAll('.team-showcase-hero__roster-photo')).toHaveLength(0);
    expect(container.querySelectorAll('.team-showcase-hero__roster-fallback')).toHaveLength(3);
  });
});
