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

const CONFIRMED_ROSTER_TAGLINE = 'Plantilla cerrada para la Temporada 2026.';
const CONFIRMED_ROSTER_DESCRIPTION =
  'Plantilla oficial confirmada para la Temporada 2026. Todos los jugadores han sido asignados.';

export const PUBLIC_LEAGUE_PLAYER_CATALOG: readonly PublicLeaguePlayerCatalogEntry[] = [
  // Barbaridad Team
  createPlayer('barbaridad', 1, 'Samu', 'Revés', 'reves', '/stock_players/player-05.svg'),
  createPlayer('barbaridad', 2, 'Alex Pla', 'Ambas', 'ambas', '/stock_players/player-03.svg'),
  createPlayer('barbaridad', 3, 'Andreu Simo', 'Ambas', 'ambas', '/stock_players/player-04.svg'),
  createPlayer('barbaridad', 4, 'Gabi', 'Ambas', 'ambas', '/stock_players/player-05.svg'),
  createPlayer('barbaridad', 5, 'Javi Moya', 'Derecha', 'derecha', '/stock_players/player-04.svg'),
  createPlayer('barbaridad', 6, 'Alejandro', 'Derecha', 'derecha', '/stock_players/player-05.svg'),

  // Thormentadores
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
    'Miguel Esteve',
    'Ambas',
    'ambas',
    '/stock_players/player-06.svg',
  ),
  createPlayer(
    'thormentadores',
    3,
    'Dani Manzano',
    'Revés',
    'reves',
    '/stock_players/player-02.svg',
  ),
  createPlayer(
    'thormentadores',
    4,
    'David Gregori',
    'Derecha',
    'derecha',
    '/stock_players/player-03.svg',
  ),
  createPlayer(
    'thormentadores',
    5,
    'Jordi Vitoria',
    'Derecha',
    'derecha',
    '/stock_players/player-06.svg',
  ),
  createPlayer(
    'thormentadores',
    6,
    'Marc Ripoll',
    'Derecha',
    'derecha',
    '/stock_players/player-02.svg',
  ),

  // Titanics
  createPlayer('titanics', 1, 'Adrian Asuncion', 'Revés', 'reves', '/stock_players/player-04.svg'),
  createPlayer('titanics', 2, 'Javi Millet', 'Ambas', 'ambas', null),
  createPlayer('titanics', 3, 'Carles Montilla', 'Revés', 'reves', null),
  createPlayer('titanics', 4, 'Brigante', 'Derecha', 'derecha', '/stock_players/player-05.svg'),
  createPlayer('titanics', 5, 'Joan Meló', 'Dreta', 'derecha', null),
  createPlayer('titanics', 6, 'Tomas', 'Revés', 'reves', '/stock_players/player-02.svg'),

  // Kings Of Favar
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
    'Raul Bataller',
    'Ambas',
    'ambas',
    '/stock_players/player-01.svg',
  ),
  createPlayer('kings-of-favar', 4, 'Tono', 'Ambas', 'ambas', '/stock_players/player-03.svg'),
  createPlayer(
    'kings-of-favar',
    5,
    'Jose Sanfelix',
    'Ambas',
    'ambas',
    '/stock_players/player-01.svg',
  ),
  createPlayer('kings-of-favar', 6, 'Damian Crespo', 'Ambas', 'ambas', null),

  // Magic City
  createPlayer('magic-city', 1, 'Adri Alvarez', 'Revés', 'reves', '/stock_players/player-03.svg'),
  createPlayer(
    'magic-city',
    2,
    'Ruben Marzal',
    'Derecha',
    'derecha',
    '/stock_players/player-01.svg',
  ),
  createPlayer('magic-city', 3, 'Dani Sanchez', 'Ambas', 'ambas', '/stock_players/player-01.svg'),
  createPlayer(
    'magic-city',
    4,
    'Josep Castello',
    'Derecha',
    'derecha',
    '/stock_players/player-04.svg',
  ),
  createPlayer('magic-city', 5, 'Emilio Esteve', 'Ambas', 'ambas', '/stock_players/player-04.svg'),
  createPlayer('magic-city', 6, 'Artur Peris', 'Ambas', 'ambas', null),
] as const;

// Temporary public catalog used until the backend is available.
export const PUBLIC_LEAGUE_TEAM_CATALOG: readonly PublicLeagueTeamCatalogEntry[] = [
  {
    id: 'kings-of-favar',
    slug: 'kings-of-favar',
    name: 'Kings Of Favar',
    presidentName: 'Vicent Ciscar',
    logoPath: '/teams_logos/Kings_of_Favar_no_bg.webp',
    tagline: CONFIRMED_ROSTER_TAGLINE,
    identityDescription: CONFIRMED_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('kings-of-favar', [
      'Vicent Ciscar',
      'Enric Bixquert',
      'Raul Bataller',
      'Tono',
      'Jose Sanfelix',
      'Damian Crespo',
    ]),
  },
  {
    id: 'magic-city',
    slug: 'magic-city',
    name: 'Magic City',
    presidentName: 'Adri Alvarez',
    logoPath: '/teams_logos/magic_ng_bg.webp',
    tagline: CONFIRMED_ROSTER_TAGLINE,
    identityDescription: CONFIRMED_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('magic-city', [
      'Adri Alvarez',
      'Ruben Marzal',
      'Dani Sanchez',
      'Josep Castello',
      'Emilio Esteve',
      'Artur Peris',
    ]),
  },
  {
    id: 'titanics',
    slug: 'titanics',
    name: 'Titanics',
    presidentName: 'Adrian Asuncion',
    logoPath: '/teams_logos/titanics_no_bg.webp',
    tagline: CONFIRMED_ROSTER_TAGLINE,
    identityDescription: CONFIRMED_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('titanics', [
      'Adrian Asuncion',
      'Javi Millet',
      'Carles Montilla',
      'Brigante',
      'Joan Meló',
      'Tomas',
    ]),
  },
  {
    id: 'barbaridad',
    slug: 'barbaridad',
    name: 'Barbaridad Team',
    presidentName: 'Samu',
    logoPath: '/teams_logos/barbarida_no_bg.webp',
    tagline: CONFIRMED_ROSTER_TAGLINE,
    identityDescription: CONFIRMED_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('barbaridad', [
      'Samu',
      'Alex Pla',
      'Andreu Simo',
      'Gabi',
      'Javi Moya',
      'Alejandro',
    ]),
  },
  {
    id: 'thormentadores',
    slug: 'thormentadores',
    name: 'Thormentadores',
    presidentName: 'Borja Vercher',
    logoPath: '/teams_logos/Thormentadores.webp',
    tagline: CONFIRMED_ROSTER_TAGLINE,
    identityDescription: CONFIRMED_ROSTER_DESCRIPTION,
    players: buildAssignedRoster('thormentadores', [
      'Borja Vercher',
      'Miguel Esteve',
      'Dani Manzano',
      'David Gregori',
      'Jordi Vitoria',
      'Marc Ripoll',
    ]),
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
