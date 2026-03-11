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
          id: 'matchday-3-kings-of-favar-barbaridad',
          homeTeamName: 'Kings of Favar',
          awayTeamName: 'Barbaridad',
          scheduledAtIso: '2026-03-15T17:00:00.000Z',
          scheduledAtLabel: 'Domingo 18:00',
        },
        {
          id: 'matchday-3-titanics-house-perez',
          homeTeamName: 'Titanics',
          awayTeamName: 'House Perez',
          scheduledAtIso: '2026-03-15T15:00:00.000Z',
          scheduledAtLabel: 'Domingo 16:00',
        },
      ],
      byeTeam: {
        teamId: 'magic-city',
        teamName: 'Magic City',
        matchdayLabel: 'Jornada 3',
      },
      standings: [
        {
          teamId: 'barbaridad',
          teamName: 'Barbaridad',
          rank: 4,
          points: 7,
          playedMatches: 2,
          gameDifference: 6,
        },
        {
          teamId: 'kings-of-favar',
          teamName: 'Kings of Favar',
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
          teamId: 'magic-city',
          teamName: 'Magic City',
          rank: 3,
          points: 5,
          playedMatches: 2,
          gameDifference: -2,
        },
        {
          teamId: 'titanics',
          teamName: 'Titanics',
          rank: 1,
          points: 9,
          playedMatches: 2,
          gameDifference: 8,
        },
      ],
      lastResults: [
        {
          id: 'result-kings-of-favar-titanics',
          homeTeamName: 'Kings of Favar',
          awayTeamName: 'Titanics',
          pairOneScore: '6-4 6-2',
          pairTwoScore: '4-6 6-3',
          homePoints: 4,
          awayPoints: 1,
          winnerTeamName: 'Kings of Favar',
        },
        {
          id: 'result-barbaridad-magic-city',
          homeTeamName: 'Barbaridad',
          awayTeamName: 'Magic City',
          pairOneScore: '7-5 6-4',
          pairTwoScore: '3-6 6-4',
          homePoints: 5,
          awayPoints: 0,
          winnerTeamName: 'Barbaridad',
        },
        {
          id: 'result-house-perez-kings-of-favar',
          homeTeamName: 'House Perez',
          awayTeamName: 'Kings of Favar',
          pairOneScore: '6-7 4-6',
          pairTwoScore: '6-4 6-2',
          homePoints: 2,
          awayPoints: 3,
          winnerTeamName: 'Kings of Favar',
        },
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
          id: 'kings-of-favar',
          slug: 'kings-of-favar',
          name: 'Kings of Favar',
          presidentName: 'Navarro',
          playerCount: 6,
        },
        {
          id: 'titanics',
          slug: 'titanics',
          name: 'Titanics',
          presidentName: 'Torres',
          playerCount: 6,
        },
        {
          id: 'barbaridad',
          slug: 'barbaridad',
          name: 'Barbaridad',
          presidentName: 'Romero',
          playerCount: 6,
        },
        {
          id: 'magic-city',
          slug: 'magic-city',
          name: 'Magic City',
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
