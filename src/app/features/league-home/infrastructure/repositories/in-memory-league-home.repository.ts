import { Injectable } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

@Injectable()
export class InMemoryLeagueHomeRepository extends LeagueHomeRepository {
  override async loadSnapshot(): Promise<LeagueHomeSnapshot> {
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
      nextMatches: [
        {
          id: 'matchday-3-navarro-romero',
          homeTeamName: 'House Navarro',
          awayTeamName: 'House Romero',
          scheduledAtIso: '2026-03-15T17:00:00.000Z',
          scheduledAtLabel: 'Domingo 18:00',
        },
        {
          id: 'matchday-3-torres-perez',
          homeTeamName: 'House Torres',
          awayTeamName: 'House Perez',
          scheduledAtIso: '2026-03-15T15:00:00.000Z',
          scheduledAtLabel: 'Domingo 16:00',
        },
      ],
      byeTeam: {
        teamId: 'house-vidal',
        teamName: 'House Vidal',
        matchdayLabel: 'Jornada 3',
      },
      standings: [
        {
          teamId: 'house-romero',
          teamName: 'House Romero',
          rank: 4,
          points: 7,
          playedMatches: 2,
          gameDifference: 6,
        },
        {
          teamId: 'house-navarro',
          teamName: 'House Navarro',
          rank: 2,
          points: 11,
          playedMatches: 2,
          gameDifference: 12,
        },
        {
          teamId: 'house-perez',
          teamName: 'House Perez',
          rank: 5,
          points: 3,
          playedMatches: 2,
          gameDifference: -7,
        },
        {
          teamId: 'house-vidal',
          teamName: 'House Vidal',
          rank: 3,
          points: 5,
          playedMatches: 2,
          gameDifference: -2,
        },
        {
          teamId: 'house-torres',
          teamName: 'House Torres',
          rank: 1,
          points: 9,
          playedMatches: 2,
          gameDifference: 8,
        },
      ],
      lastResults: [
        {
          id: 'result-navarro-torres',
          homeTeamName: 'House Navarro',
          awayTeamName: 'House Torres',
          pairOneScore: '6-4 6-2',
          pairTwoScore: '4-6 6-3',
          homePoints: 4,
          awayPoints: 1,
          winnerTeamName: 'House Navarro',
        },
        {
          id: 'result-romero-vidal',
          homeTeamName: 'House Romero',
          awayTeamName: 'House Vidal',
          pairOneScore: '7-5 6-4',
          pairTwoScore: '3-6 6-4',
          homePoints: 5,
          awayPoints: 0,
          winnerTeamName: 'House Romero',
        },
        {
          id: 'result-perez-navarro',
          homeTeamName: 'House Perez',
          awayTeamName: 'House Navarro',
          pairOneScore: '6-7 4-6',
          pairTwoScore: '6-4 6-2',
          homePoints: 2,
          awayPoints: 3,
          winnerTeamName: 'House Navarro',
        },
        {
          id: 'result-torres-romero',
          homeTeamName: 'House Torres',
          awayTeamName: 'House Romero',
          pairOneScore: '6-1 6-2',
          pairTwoScore: '6-3 6-4',
          homePoints: 5,
          awayPoints: 0,
          winnerTeamName: 'House Torres',
        },
      ],
      teams: [
        {
          id: 'house-navarro',
          slug: 'house-navarro',
          name: 'House Navarro',
          presidentName: 'Navarro',
          playerCount: 6,
        },
        {
          id: 'house-torres',
          slug: 'house-torres',
          name: 'House Torres',
          presidentName: 'Torres',
          playerCount: 6,
        },
        {
          id: 'house-romero',
          slug: 'house-romero',
          name: 'House Romero',
          presidentName: 'Romero',
          playerCount: 6,
        },
        {
          id: 'house-vidal',
          slug: 'house-vidal',
          name: 'House Vidal',
          presidentName: 'Vidal',
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
    };
  }
}
