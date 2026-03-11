import { Injectable } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import {
  type LeagueHomeSnapshot,
  type TeamPlayerSummary,
  type TeamProfileSummary,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';

type TeamCatalogEntry = TeamProfileSummary;

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
      teams: TEAM_CATALOG.map(toTeamSummary),
      teamProfiles: TEAM_CATALOG.map(toTeamProfileSummary),
    };
  }
}

const TEAM_CATALOG: readonly TeamCatalogEntry[] = [
  {
    id: 'kings-of-favar',
    slug: 'kings-of-favar',
    name: 'Kings of Favar',
    presidentName: 'Navarro',
    tagline: 'Poder ofensivo con mentalidad de espectáculo',
    identityDescription:
      'Kings of Favar compite desde la agresividad, la lectura rápida de los puntos decisivos y una identidad escénica que gira alrededor de su escudo.',
    players: [
      createPlayer('kof-1', 'Alejandro Mena', 'Drive', '/stock_players/player-01.svg'),
      createPlayer('kof-2', 'Raul Pizarro', 'Revés', '/stock_players/player-02.svg'),
      createPlayer('kof-3', 'Sergio Vela', 'Especialista en volea', '/stock_players/player-03.svg'),
      createPlayer('kof-4', 'Iker Solis', 'Cierre', '/stock_players/player-04.svg'),
      createPlayer('kof-5', 'Pablo Serra', 'Rotación', '/stock_players/player-05.svg'),
      createPlayer('kof-6', 'Adrian Miret', 'Wildcard', '/stock_players/player-06.svg'),
    ],
  },
  {
    id: 'titanics',
    slug: 'titanics',
    name: 'Titanics',
    presidentName: 'Torres',
    tagline: 'Control glacial y presión constante en cada juego',
    identityDescription:
      'Titanics construye sus partidos desde la calma competitiva, el dominio del ritmo y una presencia visual fría que refuerza su marca.',
    players: [
      createPlayer('tit-1', 'Marco Vidal', 'Drive', '/stock_players/player-02.svg'),
      createPlayer('tit-2', 'Diego Llorens', 'Revés', '/stock_players/player-03.svg'),
      createPlayer('tit-3', 'Hugo Ferrer', 'Finisher', '/stock_players/player-04.svg'),
      createPlayer(
        'tit-4',
        'Javi Cuenca',
        'Especialista en defensa',
        '/stock_players/player-05.svg',
      ),
      createPlayer('tit-5', 'Luis Ortega', 'Rotación', '/stock_players/player-06.svg'),
      createPlayer('tit-6', 'Gonzalo Riera', 'Capitán de pista', '/stock_players/player-01.svg'),
    ],
  },
  {
    id: 'barbaridad',
    slug: 'barbaridad',
    name: 'Barbaridad',
    presidentName: 'Romero',
    tagline: 'Energía caótica, vértigo y golpeo sin concesiones',
    identityDescription:
      'Barbaridad abraza el impulso, acelera intercambios y convierte cada aparición en una descarga de intensidad que marca el tono de la jornada.',
    players: [
      createPlayer('bar-1', 'Ivan Soto', 'Drive', '/stock_players/player-03.svg'),
      createPlayer('bar-2', 'Nico Prieto', 'Revés', '/stock_players/player-04.svg'),
      createPlayer('bar-3', 'Dani Plaza', 'Pegada exterior', '/stock_players/player-05.svg'),
      createPlayer('bar-4', 'Carlos Mora', 'Rematador', '/stock_players/player-06.svg'),
      createPlayer('bar-5', 'Toni Gallardo', 'Rotación', '/stock_players/player-01.svg'),
      createPlayer('bar-6', 'Eloy Segura', 'Intensidad total', '/stock_players/player-02.svg'),
    ],
  },
  {
    id: 'magic-city',
    slug: 'magic-city',
    name: 'Magic City',
    presidentName: 'Vidal',
    tagline: 'Elegancia, recursos técnicos y lectura creativa',
    identityDescription:
      'Magic City se mueve con una puesta en escena luminosa, apostando por talento asociativo y soluciones inesperadas en los momentos largos.',
    players: [
      createPlayer('mc-1', 'Alberto Casas', 'Drive', '/stock_players/player-04.svg'),
      createPlayer('mc-2', 'Joel Rubio', 'Revés', '/stock_players/player-05.svg'),
      createPlayer('mc-3', 'Ruben Gil', 'Armador', '/stock_players/player-06.svg'),
      createPlayer('mc-4', 'Fran Ponce', 'Defensa alta', '/stock_players/player-01.svg'),
      createPlayer('mc-5', 'Saul Ferrando', 'Rotación', '/stock_players/player-02.svg'),
      createPlayer('mc-6', 'Miguel Tello', 'Cierre', '/stock_players/player-03.svg'),
    ],
  },
  {
    id: 'house-perez',
    slug: 'house-perez',
    name: 'House Perez',
    presidentName: 'Perez',
    tagline: 'Atrevimiento, presencia pop y ritmo alto de pista',
    identityDescription:
      'House Perez mezcla descaro visual y ambición deportiva para ocupar la primera plana con una estética muy marcada y una plantilla expresiva.',
    players: [
      createPlayer('hp-1', 'Samuel Costa', 'Drive', '/stock_players/player-05.svg'),
      createPlayer('hp-2', 'Victor Sancho', 'Revés', '/stock_players/player-06.svg'),
      createPlayer('hp-3', 'Jorge Navas', 'Explosividad', '/stock_players/player-01.svg'),
      createPlayer('hp-4', 'Cristian Alba', 'Defensa', '/stock_players/player-02.svg'),
      createPlayer('hp-5', 'Marc Roldan', 'Rotación', '/stock_players/player-03.svg'),
      createPlayer('hp-6', 'Hector Roig', 'Cambio de ritmo', '/stock_players/player-04.svg'),
    ],
  },
];

function createPlayer(
  id: string,
  displayName: string,
  roleLabel: string,
  photoPath: string,
): TeamPlayerSummary {
  return {
    id,
    displayName,
    roleLabel,
    photoPath,
  };
}

function toTeamSummary(team: TeamCatalogEntry): TeamSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    playerCount: team.players.length,
  };
}

function toTeamProfileSummary(team: TeamCatalogEntry): TeamProfileSummary {
  return {
    id: team.id,
    slug: team.slug,
    name: team.name,
    presidentName: team.presidentName,
    tagline: team.tagline,
    identityDescription: team.identityDescription,
    players: team.players,
  };
}
