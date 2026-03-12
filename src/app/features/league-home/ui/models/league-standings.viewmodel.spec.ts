import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueStandingsPageViewModel } from './league-standings.viewmodel';

describe('toLeagueStandingsPageViewModel', () => {
  it('maps standings into page rows with mobile-friendly names', () => {
    const viewModel = toLeagueStandingsPageViewModel(createSnapshot());

    expect(viewModel.standings).toEqual([
      expect.objectContaining({
        teamName: 'House Navarro',
        monogram: 'HN',
        isLeader: true,
      }),
      expect.objectContaining({
        teamName: 'House Perez',
        monogram: 'HP',
        isLast: true,
        gameDifferenceTone: 'negative',
      }),
    ]);
    expect(viewModel.tieBreakRules).toHaveLength(4);
  });
});

function createSnapshot(): LeagueHomeSnapshot {
  return {
    league: {
      name: 'KingsPadelLeague',
      tagline: 'Liga amateur de pádel por equipos con formato competitivo.',
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
    nextMatches: [],
    byeTeam: {
      teamId: 'house-vidal',
      teamName: 'House Vidal',
      matchdayLabel: 'Jornada 3',
    },
    standings: [
      createStandingEntry('house-navarro', 'House Navarro', 1, 11, 3, 12),
      createStandingEntry('house-perez', 'House Perez', 5, 3, 3, -7),
    ],
    lastResults: [],
    teams: [
      {
        id: 'house-navarro',
        slug: 'house-navarro',
        name: 'House Navarro',
        presidentName: 'Navarro',
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
    teamProfiles: [],
  };
}

function createStandingEntry(
  teamId: string,
  teamName: string,
  rank: number,
  points: number,
  playedMatches: number,
  gameDifference: number,
): LeagueHomeSnapshot['standings'][number] {
  return {
    teamId,
    teamName,
    rank,
    points,
    playedMatches,
    gameDifference,
  };
}
