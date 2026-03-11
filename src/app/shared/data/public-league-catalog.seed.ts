import { type PlayerSide } from '@features/players/domain/entities/player.entity';

export interface PublicLeaguePlayerCatalogEntry {
  readonly id: string;
  readonly slug: string;
  readonly displayName: string;
  readonly roleLabel: string;
  readonly side: PlayerSide;
  readonly photoPath: string | null;
}

export interface PublicLeagueTeamCatalogEntry {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly presidentName: string;
  readonly logoPath: string | null;
  readonly tagline: string;
  readonly identityDescription: string;
  readonly players: readonly PublicLeaguePlayerCatalogEntry[];
}

// Temporary public catalog used until the backend is available.
export const PUBLIC_LEAGUE_TEAM_CATALOG: readonly PublicLeagueTeamCatalogEntry[] = [
  {
    id: 'kings-of-favar',
    slug: 'kings-of-favar',
    name: 'Kings Of Favar',
    presidentName: 'Vicent Ciscar',
    logoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    tagline: 'Primer bloque confirmado para arrancar la temporada pública.',
    identityDescription:
      'Kings Of Favar ya muestra a sus primeros nombres confirmados mientras completa la plantilla definitiva para el arranque oficial.',
    players: [
      createPlayer(
        'kings-of-favar',
        1,
        'Vicent Ciscar',
        'Ambas',
        'ambas',
        '/stock_players/player-01.svg',
      ),
      createPlayer(
        'kings-of-favar',
        2,
        'Enric Bixquert',
        'Ambas',
        'ambas',
        '/stock_players/player-02.svg',
      ),
      createPlayer(
        'kings-of-favar',
        3,
        'Alex Pla',
        'Ambas',
        'ambas',
        '/stock_players/player-03.svg',
      ),
      createPlayer(
        'kings-of-favar',
        4,
        'Andreu Simo',
        'Ambas',
        'ambas',
        '/stock_players/player-04.svg',
      ),
    ],
  },
  {
    id: 'magic-city',
    slug: 'magic-city',
    name: 'Magic City',
    presidentName: 'Adri Alvarez',
    logoPath: '/teams_logos/magic_ng_bg.png',
    tagline: 'Identidad técnica y plantilla en construcción con primeros nombres cerrados.',
    identityDescription:
      'Magic City abre su escaparate público con un único jugador confirmado por ahora y el resto de plazas pendientes de anunciar.',
    players: [
      createPlayer(
        'magic-city',
        1,
        'Adri Alvarez',
        'Revés',
        'reves',
        '/stock_players/player-03.svg',
      ),
      createPlayer(
        'magic-city',
        2,
        'Josep Castello',
        'Derecha',
        'derecha',
        '/stock_players/player-04.svg',
      ),
    ],
  },
  {
    id: 'titanics',
    slug: 'titanics',
    name: 'Titanics',
    presidentName: 'Adrian Asuncion',
    logoPath: '/teams_logos/titanics_no_bg.png',
    tagline: 'Estructura competitiva definida a la espera del calendario oficial.',
    identityDescription:
      'Titanics ya tiene representante confirmado para la consulta pública mientras termina de cerrar el resto de la rotación.',
    players: [
      createPlayer(
        'titanics',
        1,
        'Adrian Asuncion',
        'Revés',
        'reves',
        '/stock_players/player-04.svg',
      ),
      createPlayer('titanics', 2, 'Brigante', 'Derecha', 'derecha', '/stock_players/player-05.svg'),
      createPlayer('titanics', 3, 'Carles Montilla', 'Revés', 'reves', null),
      createPlayer('titanics', 4, 'Dani Sanchez', 'Ambas', 'ambas', '/stock_players/player-01.svg'),
      createPlayer('titanics', 5, 'Dani Manzano', 'Revés', 'reves', '/stock_players/player-02.svg'),
      createPlayer(
        'titanics',
        6,
        'David Gregori',
        'Derecha',
        'derecha',
        '/stock_players/player-03.svg',
      ),
      createPlayer(
        'titanics',
        7,
        'Emilio Esteve',
        'Ambas',
        'ambas',
        '/stock_players/player-04.svg',
      ),
      createPlayer('titanics', 8, 'Gabi', 'Ambas', 'ambas', '/stock_players/player-05.svg'),
      createPlayer(
        'titanics',
        9,
        'Jordi Vitoria',
        'Derecha',
        'derecha',
        '/stock_players/player-06.svg',
      ),
      createPlayer(
        'titanics',
        10,
        'Jose Sanfelix',
        'Ambas',
        'ambas',
        '/stock_players/player-01.svg',
      ),
      createPlayer(
        'titanics',
        11,
        'Marc Ripoll',
        'Derecha',
        'derecha',
        '/stock_players/player-02.svg',
      ),
    ],
  },
  {
    id: 'barbaridad',
    slug: 'barbaridad',
    name: 'Barbaridad Team',
    presidentName: 'Samu',
    logoPath: '/teams_logos/barbarida_no_bg.png',
    tagline: 'Proyecto abierto con la primera ficha ya visible para la jornada de consulta.',
    identityDescription:
      'Barbaridad Team utiliza esta versión pública para enseñar los nombres ya confirmados mientras incorpora el resto de jugadores.',
    players: [
      createPlayer('barbaridad', 1, 'Samu', 'Revés', 'reves', '/stock_players/player-05.svg'),
      createPlayer(
        'barbaridad',
        2,
        'Miguel Esteve',
        'Ambas',
        'ambas',
        '/stock_players/player-06.svg',
      ),
      createPlayer(
        'barbaridad',
        3,
        'Raul Bataller',
        'Ambas',
        'ambas',
        '/stock_players/player-01.svg',
      ),
    ],
  },
  {
    id: 'thormentadores',
    slug: 'thormentadores',
    name: 'Thormentadores',
    presidentName: 'Borja Vercher',
    logoPath: '/teams_logos/Thormentadores.png',
    tagline: 'Nueva escuadra publicada con un primer nombre confirmado.',
    identityDescription:
      'Thormentadores entra en la web pública sin calendario ni estadísticas, con la plantilla todavía en proceso de confirmación.',
    players: [
      createPlayer(
        'thormentadores',
        1,
        'Borja Vercher',
        'Ambas',
        'ambas',
        '/stock_players/player-06.svg',
      ),
      createPlayer(
        'thormentadores',
        2,
        'Ruben Marzal',
        'Derecha',
        'derecha',
        '/stock_players/player-01.svg',
      ),
      createPlayer('thormentadores', 3, 'Tomas', 'Revés', 'reves', '/stock_players/player-02.svg'),
      createPlayer('thormentadores', 4, 'Tono', 'Ambas', 'ambas', '/stock_players/player-03.svg'),
      createPlayer(
        'thormentadores',
        5,
        'Javi Moya',
        'Derecha',
        'derecha',
        '/stock_players/player-04.svg',
      ),
      createPlayer(
        'thormentadores',
        6,
        'Alejandro',
        'Derecha',
        'derecha',
        '/stock_players/player-05.svg',
      ),
    ],
  },
] as const;

function createPlayer(
  teamId: string,
  index: number,
  displayName: string,
  roleLabel: string,
  side: PlayerSide,
  _photoPath: string | null,
): PublicLeaguePlayerCatalogEntry {
  return {
    id: `${teamId}-player-${index}`,
    slug: toSlug(displayName),
    displayName,
    roleLabel,
    side,
    photoPath: null,
  };
}

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
