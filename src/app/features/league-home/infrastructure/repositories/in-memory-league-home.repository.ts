import { Injectable } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';
import {
  type LeagueHomeSnapshot,
  type TeamPlayerSummary,
  type TeamProfileSummary,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';
import {
  PUBLIC_LEAGUE_TEAM_CATALOG,
  type PublicLeaguePlayerCatalogEntry,
  type PublicLeagueTeamCatalogEntry,
} from '@shared/data/public-league-catalog.seed';

@Injectable()
export class InMemoryLeagueHomeRepository extends LeagueHomeRepository {
  override async loadSnapshot(_forceRefresh = false): Promise<LeagueHomeSnapshot> {
    return {
      league: {
        name: 'KingsPadelLeague',
        tagline: 'Liga amateur de pádel',
        seasonLabel: 'Temporada 2026',
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
          id: 'j3-enc1',
          homeTeamName: 'Kings Of Favar',
          awayTeamName: 'Barbaridad Team',
          scheduledAtIso: '2026-03-15T17:00:00.000+01:00',
          scheduledAtLabel: 'dom 15 mar · 17:00',
        },
        {
          id: 'j3-enc2',
          homeTeamName: 'Magic City',
          awayTeamName: 'Thormentadores',
          scheduledAtIso: '2026-03-15T18:30:00.000+01:00',
          scheduledAtLabel: 'dom 15 mar · 18:30',
        },
      ],
      byeTeam: {
        teamId: 'titanics',
        teamName: 'Titanics',
        matchdayLabel: 'Jornada 3',
      },
      standings: [
        {
          teamId: 'titanics',
          teamName: 'Titanics',
          rank: 1,
          points: 7,
          playedMatches: 2,
          gameDifference: 13,
        },
        {
          teamId: 'kings-of-favar',
          teamName: 'Kings Of Favar',
          rank: 2,
          points: 6,
          playedMatches: 2,
          gameDifference: 0,
        },
        {
          teamId: 'thormentadores',
          teamName: 'Thormentadores',
          rank: 3,
          points: 5,
          playedMatches: 1,
          gameDifference: 16,
        },
        {
          teamId: 'magic-city',
          teamName: 'Magic City',
          rank: 4,
          points: 2,
          playedMatches: 1,
          gameDifference: -1,
        },
        {
          teamId: 'barbaridad',
          teamName: 'Barbaridad Team',
          rank: 5,
          points: 0,
          playedMatches: 2,
          gameDifference: -28,
        },
      ],
      lastResults: [
        {
          id: 'j2-enc1',
          homeTeamName: 'Kings Of Favar',
          awayTeamName: 'Titanics',
          pairOneScore: '6/4 · 7/5',
          pairTwoScore: '3/6 · 4/6',
          homePoints: 3,
          awayPoints: 2,
          winnerTeamName: 'Kings Of Favar',
        },
        {
          id: 'j2-enc2',
          homeTeamName: 'Barbaridad Team',
          awayTeamName: 'Thormentadores',
          pairOneScore: '2/6 · 3/6',
          pairTwoScore: '1/6 · 2/6',
          homePoints: 0,
          awayPoints: 5,
          winnerTeamName: 'Thormentadores',
        },
      ],
      teams: PUBLIC_LEAGUE_TEAM_CATALOG.map(toTeamSummary),
      teamProfiles: PUBLIC_LEAGUE_TEAM_CATALOG.map(toTeamProfileSummary),
    };
  }

  override async loadMatchdays(_forceRefresh = false): Promise<readonly LeagueMatchday[]> {
    return MOCK_MATCHDAYS;
  }
}

// ─── Mock matchdays ───────────────────────────────────────────────────────────

const MOCK_MATCHDAYS: readonly LeagueMatchday[] = [
  // ── Jornada 1 ─ Completada ──────────────────────────────────────────────────
  {
    id: 'jornada-1',
    number: 1,
    label: 'Jornada 1',
    status: 'completed',
    dateLabel: 'Domingo, 1 de marzo de 2026',
    byeTeam: {
      teamId: 'thormentadores',
      teamSlug: 'thormentadores',
      teamName: 'Thormentadores',
    },
    encounters: [
      {
        id: 'j1-enc1',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings Of Favar',
        awayTeamId: 'magic-city',
        awayTeamSlug: 'magic-city',
        awayTeamName: 'Magic City',
        homeScore: 3,
        awayScore: 2,
        status: 'completed',
        scheduledAtIso: '2026-03-01T17:00:00.000+01:00',
        scheduledAtLabel: 'dom 1 mar · 17:00',
        pairResults: [
          {
            id: 'j1-enc1-pair1',
            label: 'Pareja 1',
            homePair: {
              label: 'Kings Of Favar',
              players: [
                { id: 'kings-of-favar-player-1', displayName: 'Vicent Ciscar', roleLabel: 'Ambas' },
                { id: 'kings-of-favar-player-3', displayName: 'Alex Pla', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Magic City',
              players: [
                { id: 'magic-city-player-1', displayName: 'Adri Alvarez', roleLabel: 'Revés' },
                { id: 'magic-city-player-2', displayName: 'Josep Castello', roleLabel: 'Derecha' },
              ],
            },
            homeScoreLabel: '6/3 · 6/4',
            awayScoreLabel: '3/6 · 4/6',
            winnerTeamId: 'kings-of-favar',
          },
          {
            id: 'j1-enc1-pair2',
            label: 'Pareja 2',
            homePair: {
              label: 'Kings Of Favar',
              players: [
                {
                  id: 'kings-of-favar-player-2',
                  displayName: 'Enric Bixquert',
                  roleLabel: 'Ambas',
                },
                { id: 'kings-of-favar-player-4', displayName: 'Andreu Simo', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Magic City',
              players: [
                { id: 'magic-city-player-1', displayName: 'Adri Alvarez', roleLabel: 'Revés' },
                { id: 'magic-city-player-2', displayName: 'Josep Castello', roleLabel: 'Derecha' },
              ],
            },
            homeScoreLabel: '4/6 · 5/7',
            awayScoreLabel: '6/4 · 7/5',
            winnerTeamId: 'magic-city',
          },
        ],
      },
      {
        id: 'j1-enc2',
        homeTeamId: 'titanics',
        homeTeamSlug: 'titanics',
        homeTeamName: 'Titanics',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad Team',
        homeScore: 5,
        awayScore: 0,
        status: 'completed',
        scheduledAtIso: '2026-03-01T18:30:00.000+01:00',
        scheduledAtLabel: 'dom 1 mar · 18:30',
        pairResults: [
          {
            id: 'j1-enc2-pair1',
            label: 'Pareja 1',
            homePair: {
              label: 'Titanics',
              players: [
                { id: 'titanics-player-1', displayName: 'Adrian Asuncion', roleLabel: 'Revés' },
                { id: 'titanics-player-2', displayName: 'Brigante', roleLabel: 'Derecha' },
              ],
            },
            awayPair: {
              label: 'Barbaridad Team',
              players: [
                { id: 'barbaridad-player-1', displayName: 'Samu', roleLabel: 'Revés' },
                { id: 'barbaridad-player-3', displayName: 'Raul Bataller', roleLabel: 'Ambas' },
              ],
            },
            homeScoreLabel: '6/2 · 6/3',
            awayScoreLabel: '2/6 · 3/6',
            winnerTeamId: 'titanics',
          },
          {
            id: 'j1-enc2-pair2',
            label: 'Pareja 2',
            homePair: {
              label: 'Titanics',
              players: [
                { id: 'titanics-player-3', displayName: 'Carles Montilla', roleLabel: 'Revés' },
                { id: 'titanics-player-4', displayName: 'Dani Sanchez', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Barbaridad Team',
              players: [
                { id: 'barbaridad-player-2', displayName: 'Miguel Esteve', roleLabel: 'Ambas' },
                { id: 'barbaridad-player-3', displayName: 'Raul Bataller', roleLabel: 'Ambas' },
              ],
            },
            homeScoreLabel: '6/3 · 7/5',
            awayScoreLabel: '3/6 · 5/7',
            winnerTeamId: 'titanics',
          },
        ],
      },
    ],
  },

  // ── Jornada 2 ─ Completada ──────────────────────────────────────────────────
  {
    id: 'jornada-2',
    number: 2,
    label: 'Jornada 2',
    status: 'completed',
    dateLabel: 'Domingo, 8 de marzo de 2026',
    byeTeam: {
      teamId: 'magic-city',
      teamSlug: 'magic-city',
      teamName: 'Magic City',
    },
    encounters: [
      {
        id: 'j2-enc1',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings Of Favar',
        awayTeamId: 'titanics',
        awayTeamSlug: 'titanics',
        awayTeamName: 'Titanics',
        homeScore: 3,
        awayScore: 2,
        status: 'completed',
        scheduledAtIso: '2026-03-08T17:00:00.000+01:00',
        scheduledAtLabel: 'dom 8 mar · 17:00',
        pairResults: [
          {
            id: 'j2-enc1-pair1',
            label: 'Pareja 1',
            homePair: {
              label: 'Kings Of Favar',
              players: [
                { id: 'kings-of-favar-player-1', displayName: 'Vicent Ciscar', roleLabel: 'Ambas' },
                {
                  id: 'kings-of-favar-player-2',
                  displayName: 'Enric Bixquert',
                  roleLabel: 'Ambas',
                },
              ],
            },
            awayPair: {
              label: 'Titanics',
              players: [
                { id: 'titanics-player-1', displayName: 'Adrian Asuncion', roleLabel: 'Revés' },
                { id: 'titanics-player-2', displayName: 'Brigante', roleLabel: 'Derecha' },
              ],
            },
            homeScoreLabel: '6/4 · 7/5',
            awayScoreLabel: '4/6 · 5/7',
            winnerTeamId: 'kings-of-favar',
          },
          {
            id: 'j2-enc1-pair2',
            label: 'Pareja 2',
            homePair: {
              label: 'Kings Of Favar',
              players: [
                { id: 'kings-of-favar-player-3', displayName: 'Alex Pla', roleLabel: 'Ambas' },
                { id: 'kings-of-favar-player-4', displayName: 'Andreu Simo', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Titanics',
              players: [
                { id: 'titanics-player-3', displayName: 'Carles Montilla', roleLabel: 'Revés' },
                { id: 'titanics-player-4', displayName: 'Dani Sanchez', roleLabel: 'Ambas' },
              ],
            },
            homeScoreLabel: '3/6 · 4/6',
            awayScoreLabel: '6/3 · 6/4',
            winnerTeamId: 'titanics',
          },
        ],
      },
      {
        id: 'j2-enc2',
        homeTeamId: 'barbaridad',
        homeTeamSlug: 'barbaridad',
        homeTeamName: 'Barbaridad Team',
        awayTeamId: 'thormentadores',
        awayTeamSlug: 'thormentadores',
        awayTeamName: 'Thormentadores',
        homeScore: 0,
        awayScore: 5,
        status: 'completed',
        scheduledAtIso: '2026-03-08T18:30:00.000+01:00',
        scheduledAtLabel: 'dom 8 mar · 18:30',
        pairResults: [
          {
            id: 'j2-enc2-pair1',
            label: 'Pareja 1',
            homePair: {
              label: 'Barbaridad Team',
              players: [
                { id: 'barbaridad-player-1', displayName: 'Samu', roleLabel: 'Revés' },
                { id: 'barbaridad-player-2', displayName: 'Miguel Esteve', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Thormentadores',
              players: [
                { id: 'thormentadores-player-1', displayName: 'Borja Vercher', roleLabel: 'Ambas' },
                {
                  id: 'thormentadores-player-2',
                  displayName: 'Ruben Marzal',
                  roleLabel: 'Derecha',
                },
              ],
            },
            homeScoreLabel: '2/6 · 3/6',
            awayScoreLabel: '6/2 · 6/3',
            winnerTeamId: 'thormentadores',
          },
          {
            id: 'j2-enc2-pair2',
            label: 'Pareja 2',
            homePair: {
              label: 'Barbaridad Team',
              players: [
                { id: 'barbaridad-player-3', displayName: 'Raul Bataller', roleLabel: 'Ambas' },
                { id: 'barbaridad-player-2', displayName: 'Miguel Esteve', roleLabel: 'Ambas' },
              ],
            },
            awayPair: {
              label: 'Thormentadores',
              players: [
                { id: 'thormentadores-player-3', displayName: 'Tomas', roleLabel: 'Revés' },
                { id: 'thormentadores-player-4', displayName: 'Tono', roleLabel: 'Ambas' },
              ],
            },
            homeScoreLabel: '1/6 · 2/6',
            awayScoreLabel: '6/1 · 6/2',
            winnerTeamId: 'thormentadores',
          },
        ],
      },
    ],
  },

  // ── Jornada 3 ─ En juego ────────────────────────────────────────────────────
  {
    id: 'jornada-3',
    number: 3,
    label: 'Jornada 3',
    status: 'current',
    dateLabel: 'Domingo, 15 de marzo de 2026',
    byeTeam: {
      teamId: 'titanics',
      teamSlug: 'titanics',
      teamName: 'Titanics',
    },
    encounters: [
      {
        id: 'j3-enc1',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings Of Favar',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad Team',
        homeScore: 0,
        awayScore: 0,
        status: 'current',
        scheduledAtIso: '2026-03-15T17:00:00.000+01:00',
        scheduledAtLabel: 'dom 15 mar · 17:00',
        pairResults: [],
      },
      {
        id: 'j3-enc2',
        homeTeamId: 'magic-city',
        homeTeamSlug: 'magic-city',
        homeTeamName: 'Magic City',
        awayTeamId: 'thormentadores',
        awayTeamSlug: 'thormentadores',
        awayTeamName: 'Thormentadores',
        homeScore: 0,
        awayScore: 0,
        status: 'current',
        scheduledAtIso: '2026-03-15T18:30:00.000+01:00',
        scheduledAtLabel: 'dom 15 mar · 18:30',
        pairResults: [],
      },
    ],
  },

  // ── Jornada 4 ─ Próxima ─────────────────────────────────────────────────────
  {
    id: 'jornada-4',
    number: 4,
    label: 'Jornada 4',
    status: 'upcoming',
    dateLabel: 'Domingo, 22 de marzo de 2026',
    byeTeam: {
      teamId: 'barbaridad',
      teamSlug: 'barbaridad',
      teamName: 'Barbaridad Team',
    },
    encounters: [
      {
        id: 'j4-enc1',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings Of Favar',
        awayTeamId: 'thormentadores',
        awayTeamSlug: 'thormentadores',
        awayTeamName: 'Thormentadores',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtIso: '2026-03-22T17:00:00.000+01:00',
        scheduledAtLabel: 'dom 22 mar · 17:00',
        pairResults: [],
      },
      {
        id: 'j4-enc2',
        homeTeamId: 'magic-city',
        homeTeamSlug: 'magic-city',
        homeTeamName: 'Magic City',
        awayTeamId: 'titanics',
        awayTeamSlug: 'titanics',
        awayTeamName: 'Titanics',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtIso: '2026-03-22T18:30:00.000+01:00',
        scheduledAtLabel: 'dom 22 mar · 18:30',
        pairResults: [],
      },
    ],
  },

  // ── Jornada 5 ─ Próxima ─────────────────────────────────────────────────────
  {
    id: 'jornada-5',
    number: 5,
    label: 'Jornada 5',
    status: 'upcoming',
    dateLabel: 'Domingo, 29 de marzo de 2026',
    byeTeam: {
      teamId: 'kings-of-favar',
      teamSlug: 'kings-of-favar',
      teamName: 'Kings Of Favar',
    },
    encounters: [
      {
        id: 'j5-enc1',
        homeTeamId: 'magic-city',
        homeTeamSlug: 'magic-city',
        homeTeamName: 'Magic City',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad Team',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtIso: '2026-03-29T17:00:00.000+01:00',
        scheduledAtLabel: 'dom 29 mar · 17:00',
        pairResults: [],
      },
      {
        id: 'j5-enc2',
        homeTeamId: 'titanics',
        homeTeamSlug: 'titanics',
        homeTeamName: 'Titanics',
        awayTeamId: 'thormentadores',
        awayTeamSlug: 'thormentadores',
        awayTeamName: 'Thormentadores',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtIso: '2026-03-29T18:30:00.000+01:00',
        scheduledAtLabel: 'dom 29 mar · 18:30',
        pairResults: [],
      },
    ],
  },
];

// ─── Snapshot helpers ─────────────────────────────────────────────────────────

function toTeamSummary(team: PublicLeagueTeamCatalogEntry): TeamSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    playerCount: team.players.length,
  };
}

function toTeamProfileSummary(team: PublicLeagueTeamCatalogEntry): TeamProfileSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    tagline: team.tagline,
    identityDescription: team.identityDescription,
    players: team.players.map(toTeamPlayerSummary),
  };
}

function toTeamPlayerSummary(player: PublicLeaguePlayerCatalogEntry): TeamPlayerSummary {
  return {
    id: player.id,
    slug: player.slug,
    displayName: player.displayName,
    roleLabel: player.roleLabel,
    photoPath: player.photoPath,
  };
}
