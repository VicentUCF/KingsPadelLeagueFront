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

const PENDING_ROSTER_TAGLINE =
  'Presidencia confirmada y resto de plantilla pendiente de asignación.';
const PENDING_ROSTER_DESCRIPTION =
  'El equipo ya tiene presidencia confirmada y solo el presidente figura en la plantilla pública hasta cerrar la asignación oficial del resto de jugadores.';

export const PUBLIC_LEAGUE_PLAYER_CATALOG: readonly PublicLeaguePlayerCatalogEntry[] = [
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
  createPlayer('kings-of-favar', 3, 'Alex Pla', 'Ambas', 'ambas', '/stock_players/player-03.svg'),
  createPlayer(
    'kings-of-favar',
    4,
    'Andreu Simo',
    'Ambas',
    'ambas',
    '/stock_players/player-04.svg',
  ),
  createPlayer('magic-city', 1, 'Adri Alvarez', 'Revés', 'reves', '/stock_players/player-03.svg'),
  createPlayer(
    'magic-city',
    2,
    'Josep Castello',
    'Derecha',
    'derecha',
    '/stock_players/player-04.svg',
  ),
  createPlayer('titanics', 1, 'Adrian Asuncion', 'Revés', 'reves', '/stock_players/player-04.svg'),
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
  createPlayer('titanics', 7, 'Emilio Esteve', 'Ambas', 'ambas', '/stock_players/player-04.svg'),
  createPlayer('titanics', 8, 'Gabi', 'Ambas', 'ambas', '/stock_players/player-05.svg'),
  createPlayer(
    'titanics',
    9,
    'Jordi Vitoria',
    'Derecha',
    'derecha',
    '/stock_players/player-06.svg',
  ),
  createPlayer('titanics', 10, 'Jose Sanfelix', 'Ambas', 'ambas', '/stock_players/player-01.svg'),
  createPlayer('titanics', 11, 'Marc Ripoll', 'Derecha', 'derecha', '/stock_players/player-02.svg'),
  createPlayer('barbaridad', 1, 'Samu', 'Revés', 'reves', '/stock_players/player-05.svg'),
  createPlayer('barbaridad', 2, 'Miguel Esteve', 'Ambas', 'ambas', '/stock_players/player-06.svg'),
  createPlayer('barbaridad', 3, 'Raul Bataller', 'Ambas', 'ambas', '/stock_players/player-01.svg'),
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
  createPlayer('sin-equipo', 1, 'Artur Peris', 'Ambas', 'ambas', null),
  createPlayer('sin-equipo', 2, 'Damian Crespo', 'Ambas', 'ambas', null),
] as const;

// Temporary public catalog used until the backend is available.
export const PUBLIC_LEAGUE_TEAM_CATALOG: readonly PublicLeagueTeamCatalogEntry[] = [
  {
    id: 'kings-of-favar',
    slug: 'kings-of-favar',
    name: 'Kings Of Favar',
    presidentName: 'Vicent Ciscar',
    logoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    tagline: PENDING_ROSTER_TAGLINE,
    identityDescription: PENDING_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('kings-of-favar', ['Vicent Ciscar', 'Enric Bixquert']),
  },
  {
    id: 'magic-city',
    slug: 'magic-city',
    name: 'Magic City',
    presidentName: 'Adri Alvarez',
    logoPath: '/teams_logos/magic_ng_bg.png',
    tagline: PENDING_ROSTER_TAGLINE,
    identityDescription: PENDING_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('magic-city', ['Adri Alvarez']),
  },
  {
    id: 'titanics',
    slug: 'titanics',
    name: 'Titanics',
    presidentName: 'Adrian Asuncion',
    logoPath: '/teams_logos/titanics_no_bg.png',
    tagline: PENDING_ROSTER_TAGLINE,
    identityDescription: PENDING_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('titanics', ['Adrian Asuncion']),
  },
  {
    id: 'barbaridad',
    slug: 'barbaridad',
    name: 'Barbaridad Team',
    presidentName: 'Samu',
    logoPath: '/teams_logos/barbarida_no_bg.png',
    tagline: PENDING_ROSTER_TAGLINE,
    identityDescription: PENDING_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('barbaridad', ['Samu']),
  },
  {
    id: 'thormentadores',
    slug: 'thormentadores',
    name: 'Thormentadores',
    presidentName: 'Borja Vercher',
    logoPath: '/teams_logos/Thormentadores.png',
    tagline: PENDING_ROSTER_TAGLINE,
    identityDescription: PENDING_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('thormentadores', ['Borja Vercher']),
  },
] as const;

function buildAssignedRoster(
  teamId: string,
  assignedPlayerNames: readonly string[],
): readonly PublicLeaguePlayerCatalogEntry[] {
  return PUBLIC_LEAGUE_PLAYER_CATALOG.filter(
    (player) =>
      player.id.startsWith(`${teamId}-`) && assignedPlayerNames.includes(player.displayName),
  );
}

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
