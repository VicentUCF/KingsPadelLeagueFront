import { provideRouter } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { MatchdayEncounterCardComponent } from './matchday-encounter-card.component';

describe('MatchdayEncounterCardComponent', () => {
  it('renders the encounter score and pair breakdown', async () => {
    await render(MatchdayEncounterCardComponent, {
      providers: [provideRouter([])],
      inputs: {
        encounter: {
          id: 'matchday-3-kings-of-favar-barbaridad',
          statusLabel: 'En juego',
          statusTone: 'live',
          scoreLabel: '1 - 0',
          metaLabel: 'En juego · Domingo 18:00',
          scheduledAtLabel: 'Domingo 18:00',
          homeTeam: {
            teamId: 'kings-of-favar',
            teamName: 'Kings of Favar',
            monogram: 'KF',
            logoPath: null,
            palette: {
              primary: '#f3c84b',
              accent: '#f9e9a7',
              surface: '#24150b',
              glow: 'rgb(243 200 75 / 0.46)',
              contrast: '#0d0904',
            },
            teamLink: '/equipos/kings-of-favar',
          },
          awayTeam: {
            teamId: 'barbaridad',
            teamName: 'Barbaridad',
            monogram: 'BA',
            logoPath: null,
            palette: {
              primary: '#ff7848',
              accent: '#ffd0b5',
              surface: '#2a140f',
              glow: 'rgb(255 120 72 / 0.38)',
              contrast: '#140806',
            },
            teamLink: '/equipos/barbaridad',
          },
          pairResults: [
            {
              id: 'pair-1',
              label: 'Partido 1',
              homeScoreLabel: '6-4 6-3',
              awayScoreLabel: '4-6 3-6',
              homePair: {
                label: 'Pareja 1',
                players: [
                  {
                    id: 'kof-1',
                    displayName: 'Alejandro Mena',
                    roleLabel: 'Drive',
                  },
                  {
                    id: 'kof-2',
                    displayName: 'Raul Pizarro',
                    roleLabel: 'Revés',
                  },
                ],
              },
              awayPair: {
                label: 'Pareja 1',
                players: [
                  {
                    id: 'bar-1',
                    displayName: 'Ivan Soto',
                    roleLabel: 'Drive',
                  },
                  {
                    id: 'bar-2',
                    displayName: 'Nico Prieto',
                    roleLabel: 'Revés',
                  },
                ],
              },
              winnerTeamName: 'Kings of Favar',
              winnerSide: 'home',
            },
          ],
          emptyPairResultsMessage: 'Resultados pendientes de publicación.',
        },
      },
    });

    expect(screen.getByRole('heading', { name: /Kings of Favar vs Barbaridad/i })).toBeVisible();
    expect(screen.getByText('1 - 0')).toBeVisible();
    expect(screen.getByText('Partido 1')).toBeVisible();
    expect(screen.getByText('6-4 6-3')).toBeVisible();
    expect(screen.getByText('4-6 3-6')).toBeVisible();
    expect(screen.getByText('Alejandro Mena')).toBeVisible();
    expect(screen.getByText('Ivan Soto')).toBeVisible();
    expect(screen.getByText(/Kings of Favar se lleva el punto/i)).toBeVisible();
  });

  it('renders a pending message when there are no published pair results', async () => {
    await render(MatchdayEncounterCardComponent, {
      providers: [provideRouter([])],
      inputs: {
        encounter: {
          id: 'matchday-4-magic-city-house-perez',
          statusLabel: 'Programada',
          statusTone: 'scheduled',
          scoreLabel: 'Pendiente',
          metaLabel: 'Programada · Domingo 12:00',
          scheduledAtLabel: 'Domingo 12:00',
          homeTeam: {
            teamId: 'magic-city',
            teamName: 'Magic City',
            monogram: 'MC',
            logoPath: null,
            palette: {
              primary: '#69f6d1',
              accent: '#c7ffef',
              surface: '#0d2721',
              glow: 'rgb(105 246 209 / 0.36)',
              contrast: '#05100f',
            },
            teamLink: '/equipos/magic-city',
          },
          awayTeam: {
            teamId: 'house-perez',
            teamName: 'House Perez',
            monogram: 'HP',
            logoPath: null,
            palette: {
              primary: '#f06bb5',
              accent: '#ffd4ef',
              surface: '#29111f',
              glow: 'rgb(240 107 181 / 0.38)',
              contrast: '#12070d',
            },
            teamLink: '/equipos/house-perez',
          },
          pairResults: [],
          emptyPairResultsMessage: 'Resultados pendientes de publicación.',
        },
      },
    });

    expect(screen.getByText('Resultados pendientes de publicación.')).toBeVisible();
  });
});
