import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueHomeViewModel } from './league-home.viewmodel';

describe('toLeagueHomeViewModel', () => {
  it('maps standings entries to premium leaderboard tones', () => {
    const viewModel = toLeagueHomeViewModel(createSnapshot());

    expect(viewModel.standings).toEqual([
      expect.objectContaining({
        teamName: 'House Navarro',
        rankTone: 'leader',
        gameDifferenceTone: 'positive',
      }),
      expect.objectContaining({
        teamName: 'House Torres',
        rankTone: 'podium',
        gameDifferenceTone: 'neutral',
      }),
      expect.objectContaining({
        teamName: 'House Perez',
        rankTone: 'standard',
        gameDifferenceTone: 'negative',
      }),
    ]);
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
    nextMatches: [],
    byeTeam: {
      teamId: 'house-vidal',
      teamName: 'House Vidal',
      matchdayLabel: 'Jornada 3',
    },
    standings: [
      createStandingEntry('house-navarro', 'House Navarro', 1, 11, 2, 12),
      createStandingEntry('house-torres', 'House Torres', 2, 9, 2, 0),
      createStandingEntry('house-perez', 'House Perez', 5, 3, 2, -7),
    ],
    lastResults: [],
    teams: [],
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
