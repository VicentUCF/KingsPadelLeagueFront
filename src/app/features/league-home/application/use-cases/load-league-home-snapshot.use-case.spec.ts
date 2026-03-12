import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import {
  type LeagueHomeSnapshot,
  type StandingEntry,
} from '@features/league-home/domain/entities/league-home-snapshot';

import { LeagueHomeRepository } from '../ports/league-home.repository';
import { LoadLeagueHomeSnapshotUseCase } from './load-league-home-snapshot.use-case';

class LeagueHomeRepositoryStub extends LeagueHomeRepository {
  override async loadSnapshot(): Promise<LeagueHomeSnapshot> {
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
      nextMatches: [
        {
          id: 'late-match',
          homeTeamName: 'House Vidal',
          awayTeamName: 'House Perez',
          scheduledAtIso: '2026-03-15T18:00:00.000Z',
          scheduledAtLabel: 'Domingo 19:00',
        },
        {
          id: 'early-match',
          homeTeamName: 'House Navarro',
          awayTeamName: 'House Torres',
          scheduledAtIso: '2026-03-15T16:00:00.000Z',
          scheduledAtLabel: 'Domingo 17:00',
        },
      ],
      byeTeam: {
        teamId: 'house-romero',
        teamName: 'House Romero',
        matchdayLabel: 'Jornada 3',
      },
      standings: [
        createStandingEntry('house-vidal', 'House Vidal', 5, 2, -1),
        createStandingEntry('house-navarro', 'House Navarro', 11, 2, 12),
        createStandingEntry('house-romero', 'House Romero', 7, 2, 4),
        createStandingEntry('house-perez', 'House Perez', 3, 2, -8),
        createStandingEntry('house-torres', 'House Torres', 11, 2, 8),
      ],
      lastResults: [
        createResult('first'),
        createResult('second'),
        createResult('third'),
        createResult('fourth'),
      ],
      teams: [
        {
          id: 'house-navarro',
          slug: 'house-navarro',
          name: 'House Navarro',
          presidentName: 'Navarro',
          playerCount: 6,
        },
      ],
      teamProfiles: [],
    };
  }

  override async loadMatchdays(): Promise<readonly LeagueMatchday[]> {
    return [];
  }
}

describe('LoadLeagueHomeSnapshotUseCase', () => {
  it('sorts standings and reassigns rank positions', async () => {
    const useCase = new LoadLeagueHomeSnapshotUseCase(new LeagueHomeRepositoryStub());

    const result = await useCase.execute();

    expect(result.standings.map((entry) => `${entry.rank}-${entry.teamName}`)).toEqual([
      '1-House Navarro',
      '2-House Torres',
      '3-House Romero',
      '4-House Vidal',
      '5-House Perez',
    ]);
  });

  it('sorts upcoming matches and limits recent results to three cards', async () => {
    const useCase = new LoadLeagueHomeSnapshotUseCase(new LeagueHomeRepositoryStub());

    const result = await useCase.execute();

    expect(result.nextMatches.map((entry) => entry.id)).toEqual(['early-match', 'late-match']);
    expect(result.lastResults).toHaveLength(3);
  });
});

function createStandingEntry(
  teamId: string,
  teamName: string,
  points: number,
  playedMatches: number,
  gameDifference: number,
): StandingEntry {
  return {
    teamId,
    teamName,
    rank: 99,
    points,
    playedMatches,
    gameDifference,
  };
}

function createResult(id: string): LeagueHomeSnapshot['lastResults'][number] {
  return {
    id,
    homeTeamName: 'House Navarro',
    awayTeamName: 'House Torres',
    pairOneScore: '6-4 6-3',
    pairTwoScore: '6-3 6-2',
    homePoints: 5,
    awayPoints: 0,
    winnerTeamName: 'House Navarro',
  };
}
