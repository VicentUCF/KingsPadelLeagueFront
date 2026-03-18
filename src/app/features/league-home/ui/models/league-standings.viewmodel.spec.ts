import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueStandingsPageViewModel } from './league-standings.viewmodel';

describe('toLeagueStandingsPageViewModel', () => {
  it('maps public standings into the detailed competition table', () => {
    const viewModel = toLeagueStandingsPageViewModel(createSnapshot(), createMatchdays());

    expect(viewModel.standings).toEqual([
      expect.objectContaining({
        teamName: 'House Navarro',
        pointsLabel: '3 pts',
        playedLabel: '1',
        wonLabel: '1',
        lostLabel: '0',
        wonGamesLabel: '29',
        lostGamesLabel: '21',
        gameDifferenceLabel: '+8',
        isLeader: true,
      }),
      expect.objectContaining({
        teamName: 'House Perez',
        pointsLabel: '0 pts',
        playedLabel: '1',
        wonLabel: '0',
        lostLabel: '1',
        wonGamesLabel: '21',
        lostGamesLabel: '29',
        gameDifferenceLabel: '-8',
        isLast: true,
        gameDifferenceTone: 'negative',
      }),
    ]);
    expect(viewModel.tieBreakRules).toHaveLength(4);
  });
});

function createMatchdays(): readonly LeagueMatchday[] {
  return [
    {
      id: 'matchday-1',
      number: 1,
      label: 'Jornada 1',
      status: 'completed',
      dateLabel: '1 marzo',
      byeTeam: null,
      encounters: [
        {
          id: 'match-1',
          homeTeamId: 'house-navarro',
          homeTeamSlug: 'house-navarro',
          homeTeamName: 'House Navarro',
          awayTeamId: 'house-perez',
          awayTeamSlug: 'house-perez',
          awayTeamName: 'House Perez',
          homeScore: 2,
          awayScore: 0,
          status: 'completed',
          scheduledAtIso: '2026-03-01T10:00:00.000Z',
          scheduledAtLabel: 'Sábado 11:00',
          pairResults: [
            createPairResult('pair-1', '6/3 · 6/4', '3/6 · 4/6', 'house-navarro'),
            createPairResult('pair-2', '4/6 · 7/5 · 6/3', '6/4 · 5/7 · 3/6', 'house-navarro'),
          ],
        },
      ],
    },
  ];
}

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
    nextMatches: [],
    byeTeam: null,
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

function createPairResult(
  id: string,
  homeScoreLabel: string,
  awayScoreLabel: string,
  winnerTeamId: string,
): LeagueMatchday['encounters'][number]['pairResults'][number] {
  return {
    id,
    label: `Pareja ${id}`,
    homePair: {
      label: 'House Navarro',
      players: [],
    },
    awayPair: {
      label: 'House Perez',
      players: [],
    },
    homeScoreLabel,
    awayScoreLabel,
    winnerTeamId,
  };
}
