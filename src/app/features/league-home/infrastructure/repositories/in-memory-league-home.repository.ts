import { Injectable } from '@angular/core';

import { LeagueHomeRepository } from '@features/league-home/application/ports/league-home.repository';
import {
  type LeagueMatchPairLineup,
  type LeagueMatchPairPlayer,
  type LeagueMatchPairResult,
  type LeagueMatchday,
  type LeagueMatchdayEncounter,
} from '@features/league-home/domain/entities/league-matchday';
import {
  type EncounterResultSummary,
  type LeagueHomeSnapshot,
  type TeamPlayerSummary,
  type TeamProfileSummary,
  type TeamSummary,
} from '@features/league-home/domain/entities/league-home-snapshot';

type TeamCatalogEntry = TeamProfileSummary;

@Injectable()
export class InMemoryLeagueHomeRepository extends LeagueHomeRepository {
  override async loadSnapshot(): Promise<LeagueHomeSnapshot> {
    const currentMatchday = resolveCurrentMatchday();

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
        current: currentMatchday.number,
        total: MATCHDAY_CATALOG.length,
        label: `${currentMatchday.label} de ${MATCHDAY_CATALOG.length}`,
      },
      nextMatches: currentMatchday.encounters.map((encounter) => ({
        id: encounter.id,
        homeTeamName: encounter.homeTeamName,
        awayTeamName: encounter.awayTeamName,
        scheduledAtIso: toScheduledAtIso(currentMatchday.id, encounter.id),
        scheduledAtLabel: encounter.scheduledAtLabel,
      })),
      byeTeam: {
        teamId: currentMatchday.byeTeam?.teamId ?? 'magic-city',
        teamName: currentMatchday.byeTeam?.teamName ?? 'Magic City',
        matchdayLabel: currentMatchday.label,
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
      lastResults: resolveLatestResults(),
      teams: TEAM_CATALOG.map(toTeamSummary),
      teamProfiles: TEAM_CATALOG.map(toTeamProfileSummary),
    };
  }

  override async loadMatchdays(): Promise<readonly LeagueMatchday[]> {
    return MATCHDAY_CATALOG;
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

const MATCHDAY_CATALOG: readonly LeagueMatchday[] = [
  {
    id: 'matchday-1',
    number: 1,
    label: 'Jornada 1',
    status: 'completed',
    dateLabel: 'Domingo 1 de marzo',
    encounters: [
      createEncounter({
        id: 'matchday-1-kings-of-favar-titanics',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings of Favar',
        awayTeamId: 'titanics',
        awayTeamSlug: 'titanics',
        awayTeamName: 'Titanics',
        homeScore: 4,
        awayScore: 1,
        status: 'completed',
        scheduledAtLabel: 'Domingo 12:00',
        pairResults: [
          createPairResult({
            id: 'matchday-1-kings-of-favar-titanics-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'kings-of-favar', ['kof-1', 'kof-2']),
            awayPair: createPairLineup('Pareja 1', 'titanics', ['tit-1', 'tit-2']),
            homeScoreLabel: '6-4 6-2',
            awayScoreLabel: '4-6 2-6',
            winnerTeamId: 'kings-of-favar',
          }),
          createPairResult({
            id: 'matchday-1-kings-of-favar-titanics-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'kings-of-favar', ['kof-3', 'kof-4']),
            awayPair: createPairLineup('Pareja 2', 'titanics', ['tit-3', 'tit-4']),
            homeScoreLabel: '4-6 6-3 7-6',
            awayScoreLabel: '6-4 3-6 6-7',
            winnerTeamId: 'kings-of-favar',
          }),
        ],
      }),
      createEncounter({
        id: 'matchday-1-barbaridad-magic-city',
        homeTeamId: 'barbaridad',
        homeTeamSlug: 'barbaridad',
        homeTeamName: 'Barbaridad',
        awayTeamId: 'magic-city',
        awayTeamSlug: 'magic-city',
        awayTeamName: 'Magic City',
        homeScore: 5,
        awayScore: 0,
        status: 'completed',
        scheduledAtLabel: 'Domingo 16:00',
        pairResults: [
          createPairResult({
            id: 'matchday-1-barbaridad-magic-city-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'barbaridad', ['bar-1', 'bar-2']),
            awayPair: createPairLineup('Pareja 1', 'magic-city', ['mc-1', 'mc-2']),
            homeScoreLabel: '7-5 6-4',
            awayScoreLabel: '5-7 4-6',
            winnerTeamId: 'barbaridad',
          }),
          createPairResult({
            id: 'matchday-1-barbaridad-magic-city-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'barbaridad', ['bar-3', 'bar-4']),
            awayPair: createPairLineup('Pareja 2', 'magic-city', ['mc-3', 'mc-4']),
            homeScoreLabel: '3-6 6-4 6-2',
            awayScoreLabel: '6-3 4-6 2-6',
            winnerTeamId: 'barbaridad',
          }),
        ],
      }),
    ],
    byeTeam: {
      teamId: 'house-perez',
      teamSlug: 'house-perez',
      teamName: 'House Perez',
    },
  },
  {
    id: 'matchday-2',
    number: 2,
    label: 'Jornada 2',
    status: 'completed',
    dateLabel: 'Domingo 8 de marzo',
    encounters: [
      createEncounter({
        id: 'matchday-2-house-perez-kings-of-favar',
        homeTeamId: 'house-perez',
        homeTeamSlug: 'house-perez',
        homeTeamName: 'House Perez',
        awayTeamId: 'kings-of-favar',
        awayTeamSlug: 'kings-of-favar',
        awayTeamName: 'Kings of Favar',
        homeScore: 2,
        awayScore: 3,
        status: 'completed',
        scheduledAtLabel: 'Domingo 11:30',
        pairResults: [
          createPairResult({
            id: 'matchday-2-house-perez-kings-of-favar-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'house-perez', ['hp-1', 'hp-2']),
            awayPair: createPairLineup('Pareja 1', 'kings-of-favar', ['kof-1', 'kof-2']),
            homeScoreLabel: '6-7 4-6',
            awayScoreLabel: '7-6 6-4',
            winnerTeamId: 'kings-of-favar',
          }),
          createPairResult({
            id: 'matchday-2-house-perez-kings-of-favar-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'house-perez', ['hp-3', 'hp-4']),
            awayPair: createPairLineup('Pareja 2', 'kings-of-favar', ['kof-3', 'kof-4']),
            homeScoreLabel: '6-4 6-2',
            awayScoreLabel: '4-6 2-6',
            winnerTeamId: 'house-perez',
          }),
        ],
      }),
      createEncounter({
        id: 'matchday-2-titanics-barbaridad',
        homeTeamId: 'titanics',
        homeTeamSlug: 'titanics',
        homeTeamName: 'Titanics',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad',
        homeScore: 5,
        awayScore: 0,
        status: 'completed',
        scheduledAtLabel: 'Domingo 15:30',
        pairResults: [
          createPairResult({
            id: 'matchday-2-titanics-barbaridad-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'titanics', ['tit-1', 'tit-2']),
            awayPair: createPairLineup('Pareja 1', 'barbaridad', ['bar-1', 'bar-2']),
            homeScoreLabel: '6-1 6-2',
            awayScoreLabel: '1-6 2-6',
            winnerTeamId: 'titanics',
          }),
          createPairResult({
            id: 'matchday-2-titanics-barbaridad-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'titanics', ['tit-3', 'tit-4']),
            awayPair: createPairLineup('Pareja 2', 'barbaridad', ['bar-3', 'bar-4']),
            homeScoreLabel: '6-3 6-4',
            awayScoreLabel: '3-6 4-6',
            winnerTeamId: 'titanics',
          }),
        ],
      }),
    ],
    byeTeam: {
      teamId: 'magic-city',
      teamSlug: 'magic-city',
      teamName: 'Magic City',
    },
  },
  {
    id: 'matchday-3',
    number: 3,
    label: 'Jornada 3',
    status: 'current',
    dateLabel: 'Domingo 15 de marzo',
    encounters: [
      createEncounter({
        id: 'matchday-3-kings-of-favar-barbaridad',
        homeTeamId: 'kings-of-favar',
        homeTeamSlug: 'kings-of-favar',
        homeTeamName: 'Kings of Favar',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad',
        homeScore: 1,
        awayScore: 0,
        status: 'current',
        scheduledAtLabel: 'Domingo 18:00',
        pairResults: [
          createPairResult({
            id: 'matchday-3-kings-of-favar-barbaridad-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'kings-of-favar', ['kof-1', 'kof-2']),
            awayPair: createPairLineup('Pareja 1', 'barbaridad', ['bar-1', 'bar-2']),
            homeScoreLabel: '6-4 6-3',
            awayScoreLabel: '4-6 3-6',
            winnerTeamId: 'kings-of-favar',
          }),
          createPairResult({
            id: 'matchday-3-kings-of-favar-barbaridad-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'kings-of-favar', ['kof-3', 'kof-4']),
            awayPair: createPairLineup('Pareja 2', 'barbaridad', ['bar-3', 'bar-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
      createEncounter({
        id: 'matchday-3-titanics-house-perez',
        homeTeamId: 'titanics',
        homeTeamSlug: 'titanics',
        homeTeamName: 'Titanics',
        awayTeamId: 'house-perez',
        awayTeamSlug: 'house-perez',
        awayTeamName: 'House Perez',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtLabel: 'Domingo 16:00',
        pairResults: [
          createPairResult({
            id: 'matchday-3-titanics-house-perez-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'titanics', ['tit-1', 'tit-2']),
            awayPair: createPairLineup('Pareja 1', 'house-perez', ['hp-1', 'hp-2']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
          createPairResult({
            id: 'matchday-3-titanics-house-perez-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'titanics', ['tit-3', 'tit-4']),
            awayPair: createPairLineup('Pareja 2', 'house-perez', ['hp-3', 'hp-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
    ],
    byeTeam: {
      teamId: 'magic-city',
      teamSlug: 'magic-city',
      teamName: 'Magic City',
    },
  },
  {
    id: 'matchday-4',
    number: 4,
    label: 'Jornada 4',
    status: 'upcoming',
    dateLabel: 'Domingo 22 de marzo',
    encounters: [
      createEncounter({
        id: 'matchday-4-magic-city-house-perez',
        homeTeamId: 'magic-city',
        homeTeamSlug: 'magic-city',
        homeTeamName: 'Magic City',
        awayTeamId: 'house-perez',
        awayTeamSlug: 'house-perez',
        awayTeamName: 'House Perez',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtLabel: 'Domingo 12:00',
        pairResults: [
          createPairResult({
            id: 'matchday-4-magic-city-house-perez-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'magic-city', ['mc-1', 'mc-2']),
            awayPair: createPairLineup('Pareja 1', 'house-perez', ['hp-1', 'hp-2']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
          createPairResult({
            id: 'matchday-4-magic-city-house-perez-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'magic-city', ['mc-3', 'mc-4']),
            awayPair: createPairLineup('Pareja 2', 'house-perez', ['hp-3', 'hp-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
      createEncounter({
        id: 'matchday-4-titanics-kings-of-favar',
        homeTeamId: 'titanics',
        homeTeamSlug: 'titanics',
        homeTeamName: 'Titanics',
        awayTeamId: 'kings-of-favar',
        awayTeamSlug: 'kings-of-favar',
        awayTeamName: 'Kings of Favar',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtLabel: 'Domingo 17:30',
        pairResults: [
          createPairResult({
            id: 'matchday-4-titanics-kings-of-favar-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'titanics', ['tit-1', 'tit-2']),
            awayPair: createPairLineup('Pareja 1', 'kings-of-favar', ['kof-1', 'kof-2']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
          createPairResult({
            id: 'matchday-4-titanics-kings-of-favar-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'titanics', ['tit-3', 'tit-4']),
            awayPair: createPairLineup('Pareja 2', 'kings-of-favar', ['kof-3', 'kof-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
    ],
    byeTeam: {
      teamId: 'barbaridad',
      teamSlug: 'barbaridad',
      teamName: 'Barbaridad',
    },
  },
  {
    id: 'matchday-5',
    number: 5,
    label: 'Jornada 5',
    status: 'upcoming',
    dateLabel: 'Domingo 29 de marzo',
    encounters: [
      createEncounter({
        id: 'matchday-5-magic-city-barbaridad',
        homeTeamId: 'magic-city',
        homeTeamSlug: 'magic-city',
        homeTeamName: 'Magic City',
        awayTeamId: 'barbaridad',
        awayTeamSlug: 'barbaridad',
        awayTeamName: 'Barbaridad',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtLabel: 'Domingo 11:00',
        pairResults: [
          createPairResult({
            id: 'matchday-5-magic-city-barbaridad-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'magic-city', ['mc-1', 'mc-2']),
            awayPair: createPairLineup('Pareja 1', 'barbaridad', ['bar-1', 'bar-2']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
          createPairResult({
            id: 'matchday-5-magic-city-barbaridad-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'magic-city', ['mc-3', 'mc-4']),
            awayPair: createPairLineup('Pareja 2', 'barbaridad', ['bar-3', 'bar-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
      createEncounter({
        id: 'matchday-5-house-perez-titanics',
        homeTeamId: 'house-perez',
        homeTeamSlug: 'house-perez',
        homeTeamName: 'House Perez',
        awayTeamId: 'titanics',
        awayTeamSlug: 'titanics',
        awayTeamName: 'Titanics',
        homeScore: 0,
        awayScore: 0,
        status: 'upcoming',
        scheduledAtLabel: 'Domingo 16:30',
        pairResults: [
          createPairResult({
            id: 'matchday-5-house-perez-titanics-pair-1',
            label: 'Partido 1',
            homePair: createPairLineup('Pareja 1', 'house-perez', ['hp-1', 'hp-2']),
            awayPair: createPairLineup('Pareja 1', 'titanics', ['tit-1', 'tit-2']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
          createPairResult({
            id: 'matchday-5-house-perez-titanics-pair-2',
            label: 'Partido 2',
            homePair: createPairLineup('Pareja 2', 'house-perez', ['hp-3', 'hp-4']),
            awayPair: createPairLineup('Pareja 2', 'titanics', ['tit-3', 'tit-4']),
            homeScoreLabel: 'Pendiente',
            awayScoreLabel: 'Pendiente',
            winnerTeamId: null,
          }),
        ],
      }),
    ],
    byeTeam: {
      teamId: 'kings-of-favar',
      teamSlug: 'kings-of-favar',
      teamName: 'Kings of Favar',
    },
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

function createEncounter(encounter: LeagueMatchdayEncounter): LeagueMatchdayEncounter {
  return encounter;
}

function createPairResult(pairResult: LeagueMatchPairResult): LeagueMatchPairResult {
  return pairResult;
}

function createPairLineup(
  label: string,
  teamId: string,
  playerIds: readonly string[],
): LeagueMatchPairLineup {
  return {
    label,
    players: playerIds.map((playerId) => createPairPlayer(teamId, playerId)),
  };
}

function createPairPlayer(teamId: string, playerId: string): LeagueMatchPairPlayer {
  const team = TEAM_CATALOG.find((teamEntry) => teamEntry.id === teamId);
  const player = team?.players.find((teamPlayer) => teamPlayer.id === playerId);

  if (!player) {
    throw new Error(`Unknown team player "${playerId}" for team "${teamId}".`);
  }

  return {
    id: player.id,
    displayName: player.displayName,
    roleLabel: player.roleLabel,
  };
}

function resolveCurrentMatchday(): LeagueMatchday {
  return MATCHDAY_CATALOG.find((matchday) => matchday.status === 'current') ?? MATCHDAY_CATALOG[0]!;
}

function resolveLatestResults(): readonly EncounterResultSummary[] {
  return [...MATCHDAY_CATALOG]
    .reverse()
    .flatMap((matchday) =>
      matchday.encounters
        .filter((encounter) => encounter.status === 'completed')
        .map(toEncounterResultSummary),
    )
    .slice(0, 4);
}

function toEncounterResultSummary(encounter: LeagueMatchdayEncounter): EncounterResultSummary {
  return {
    id: `result-${encounter.id}`,
    homeTeamName: encounter.homeTeamName,
    awayTeamName: encounter.awayTeamName,
    pairOneScore: encounter.pairResults[0]?.homeScoreLabel ?? 'Pendiente',
    pairTwoScore: encounter.pairResults[1]?.homeScoreLabel ?? 'Pendiente',
    homePoints: encounter.homeScore,
    awayPoints: encounter.awayScore,
    winnerTeamName: resolveWinnerTeamName(encounter),
  };
}

function resolveWinnerTeamName(encounter: LeagueMatchdayEncounter): string {
  if (encounter.homeScore === encounter.awayScore) {
    return 'Sin ganador';
  }

  return encounter.homeScore > encounter.awayScore
    ? encounter.homeTeamName
    : encounter.awayTeamName;
}

function toScheduledAtIso(matchdayId: string, encounterId: string): string {
  const matchdayDateRegistry: Record<string, string> = {
    'matchday-1': '2026-03-01',
    'matchday-2': '2026-03-08',
    'matchday-3': '2026-03-15',
    'matchday-4': '2026-03-22',
    'matchday-5': '2026-03-29',
  };
  const encounterTimeRegistry: Record<string, string> = {
    'matchday-1-kings-of-favar-titanics': '11:00:00.000Z',
    'matchday-1-barbaridad-magic-city': '15:00:00.000Z',
    'matchday-2-house-perez-kings-of-favar': '10:30:00.000Z',
    'matchday-2-titanics-barbaridad': '14:30:00.000Z',
    'matchday-3-kings-of-favar-barbaridad': '17:00:00.000Z',
    'matchday-3-titanics-house-perez': '15:00:00.000Z',
    'matchday-4-magic-city-house-perez': '11:00:00.000Z',
    'matchday-4-titanics-kings-of-favar': '16:30:00.000Z',
    'matchday-5-magic-city-barbaridad': '10:00:00.000Z',
    'matchday-5-house-perez-titanics': '15:30:00.000Z',
  };

  return `${matchdayDateRegistry[matchdayId] ?? '2026-03-15'}T${
    encounterTimeRegistry[encounterId] ?? '15:00:00.000Z'
  }`;
}
