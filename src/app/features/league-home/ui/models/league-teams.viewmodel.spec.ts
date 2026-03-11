import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueTeamsPageViewModel } from './league-teams.viewmodel';

describe('toLeagueTeamsPageViewModel', () => {
  it('selects the first team as the initial preview target', () => {
    const viewModel = toLeagueTeamsPageViewModel(createSnapshot());

    expect(viewModel.initialSelectedSlug).toBe('kings-of-favar');
    expect(viewModel.teams[0]).toEqual(
      expect.objectContaining({
        name: 'Kings of Favar',
        teamLink: '/equipos/kings-of-favar',
      }),
    );
  });
});

function createSnapshot(): LeagueHomeSnapshot {
  return {
    league: {
      name: 'KingsPadelLeague',
      tagline: 'La liga de pádel competitiva',
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
        teamId: 'kings-of-favar',
        teamName: 'Kings of Favar',
        rank: 1,
        points: 11,
        playedMatches: 2,
        gameDifference: 12,
      },
    ],
    nextMatches: [],
    byeTeam: {
      teamId: 'magic-city',
      teamName: 'Magic City',
      matchdayLabel: 'Jornada 3',
    },
    lastResults: [],
    teams: [
      {
        id: 'kings-of-favar',
        slug: 'kings-of-favar',
        name: 'Kings of Favar',
        presidentName: 'Navarro',
        playerCount: 6,
      },
    ],
    teamProfiles: [
      {
        id: 'kings-of-favar',
        slug: 'kings-of-favar',
        name: 'Kings of Favar',
        presidentName: 'Navarro',
        tagline: 'Poder ofensivo con mentalidad de espectáculo',
        identityDescription: 'Identidad de prueba',
        players: [
          {
            id: 'kof-1',
            displayName: 'Alejandro Mena',
            roleLabel: 'Drive',
            photoPath: null,
          },
        ],
      },
    ],
  };
}
