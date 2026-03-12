import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueTeamProfilePageViewModel } from './league-team-profile.viewmodel';

describe('toLeagueTeamProfilePageViewModel', () => {
  it('maps roster, branded palette and supporting copy for a team profile', () => {
    const viewModel = toLeagueTeamProfilePageViewModel(createSnapshot(), 'titanics');

    expect(viewModel).toEqual(
      expect.objectContaining({
        rosterTitle: 'Plantilla del equipo',
        team: expect.objectContaining({
          name: 'Titanics',
          logoPath: '/teams_logos/titanics_no_bg.png',
          nextMatchLabel: 'Domingo 18:00 · vs Kings of Favar',
          latestResultLabel: 'Llega tras ganar a Barbaridad por 5-0.',
          roster: [
            expect.objectContaining({
              displayName: 'Marco Vidal',
              photoAlt: '',
            }),
          ],
        }),
      }),
    );
  });

  it('keeps curated palette information even when a team has no uploaded logo', () => {
    const viewModel = toLeagueTeamProfilePageViewModel(createSnapshot(), 'house-perez');

    expect(viewModel?.team).toEqual(
      expect.objectContaining({
        name: 'House Perez',
        logoPath: null,
        palette: expect.objectContaining({
          primary: '#f06bb5',
        }),
      }),
    );
  });

  it('returns null when the slug does not match any team profile', () => {
    expect(toLeagueTeamProfilePageViewModel(createSnapshot(), 'unknown-team')).toBeNull();
  });

  it('shows a publication-pending next match label when the calendar is still empty', () => {
    const viewModel = toLeagueTeamProfilePageViewModel(
      {
        ...createSnapshot(),
        currentMatchday: {
          current: 0,
          total: 0,
          label: 'Por anunciar',
        },
        standings: [
          {
            teamId: 'titanics',
            teamName: 'Titanics',
            rank: 1,
            points: 0,
            playedMatches: 0,
            gameDifference: 0,
          },
        ],
        nextMatches: [],
        byeTeam: null,
        lastResults: [],
      } as unknown as LeagueHomeSnapshot,
      'titanics',
    );

    expect(viewModel?.team).toEqual(
      expect.objectContaining({
        nextMatchLabel: 'Por anunciar',
        latestResultLabel: 'Aún no se ha disputado ningún partido oficial.',
        facts: expect.arrayContaining([
          expect.objectContaining({
            label: 'Clasificación',
            value: '#1 · 0 pts · 0',
          }),
          expect.objectContaining({
            label: 'Próxima cita',
            value: 'Por anunciar',
          }),
        ]),
      }),
    );
  });
});

function createSnapshot(): LeagueHomeSnapshot {
  return {
    league: {
      name: 'KingsPadelLeague',
      tagline: 'Liga amateur de pádel',
      seasonLabel: 'Temporada 1',
    },
    currentPhase: {
      code: 'regular-season',
      label: 'Fase regular',
    },
    currentMatchday: {
      current: 3,
      total: 5,
      label: 'Jornada 3 de 5',
    },
    standings: [
      {
        teamId: 'titanics',
        teamName: 'Titanics',
        rank: 1,
        points: 9,
        playedMatches: 2,
        gameDifference: 8,
      },
      {
        teamId: 'house-perez',
        teamName: 'House Perez',
        rank: 5,
        points: 3,
        playedMatches: 2,
        gameDifference: -7,
      },
    ],
    nextMatches: [
      {
        id: 'matchday-3-kings-of-favar-titanics',
        homeTeamName: 'Kings of Favar',
        awayTeamName: 'Titanics',
        scheduledAtIso: '2026-03-15T17:00:00.000Z',
        scheduledAtLabel: 'Domingo 18:00',
      },
    ],
    byeTeam: {
      teamId: 'magic-city',
      teamName: 'Magic City',
      matchdayLabel: 'Jornada 3',
    },
    lastResults: [
      {
        id: 'result-titanics-barbaridad',
        homeTeamName: 'Titanics',
        awayTeamName: 'Barbaridad',
        pairOneScore: '6-1 6-2',
        pairTwoScore: '6-3 6-4',
        homePoints: 5,
        awayPoints: 0,
        winnerTeamName: 'Titanics',
      },
    ],
    teams: [
      {
        id: 'titanics',
        slug: 'titanics',
        name: 'Titanics',
        presidentName: 'Torres',
        playerCount: 6,
      },
      {
        id: 'house-perez',
        slug: 'house-perez',
        name: 'House Perez',
        presidentName: 'Perez',
        playerCount: 6,
      },
    ],
    teamProfiles: [
      {
        id: 'titanics',
        slug: 'titanics',
        name: 'Titanics',
        presidentName: 'Torres',
        tagline: 'Control glacial y presión constante en cada juego',
        identityDescription: 'Identidad de prueba',
        players: [
          {
            id: 'tit-1',
            displayName: 'Marco Vidal',
            roleLabel: 'Drive',
            photoPath: null,
          },
        ],
      },
      {
        id: 'house-perez',
        slug: 'house-perez',
        name: 'House Perez',
        presidentName: 'Perez',
        tagline: 'Atrevimiento, presencia pop y ritmo alto de pista',
        identityDescription: 'Identidad de prueba',
        players: [
          {
            id: 'hp-1',
            displayName: 'Samuel Costa',
            roleLabel: 'Drive',
            photoPath: null,
          },
        ],
      },
    ],
  };
}
