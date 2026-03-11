import { type PlayerSide } from '@features/players/domain/entities/player.entity';

interface TeamPlayerSeed {
  readonly displayName: string;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
  readonly side: PlayerSide;
}

interface TeamSeed {
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly players: readonly TeamPlayerSeed[];
}

export interface PlayerSeed {
  readonly id: string;
  readonly slug: string;
  readonly displayName: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamLogoPath: string | null;
  readonly avatarPath: string | null;
  readonly wonMatchesCount: number;
  readonly lostMatchesCount: number;
  readonly side: PlayerSide;
}

const TEAM_SEED: readonly TeamSeed[] = [
  {
    teamId: 'kings-of-favar',
    teamName: 'Kings of Favar',
    teamLogoPath: '/teams_logos/Kings_of_Favar_no_bg.png',
    players: [
      { displayName: 'Alex Soler', wonMatchesCount: 4, lostMatchesCount: 1, side: 'derecha' },
      { displayName: 'Bruno Sanz', wonMatchesCount: 3, lostMatchesCount: 2, side: 'reves' },
      { displayName: 'Diego Ferrer', wonMatchesCount: 2, lostMatchesCount: 2, side: 'derecha' },
      { displayName: 'Hugo Navarro', wonMatchesCount: 4, lostMatchesCount: 0, side: 'reves' },
      { displayName: 'Marc Peris', wonMatchesCount: 1, lostMatchesCount: 3, side: 'ambas' },
      { displayName: 'Raul Costa', wonMatchesCount: 2, lostMatchesCount: 1, side: 'derecha' },
    ],
  },
  {
    teamId: 'titanics',
    teamName: 'Titanics',
    teamLogoPath: '/teams_logos/titanics_no_bg.png',
    players: [
      { displayName: 'Sergio Torres', wonMatchesCount: 4, lostMatchesCount: 1, side: 'reves' },
      { displayName: 'Ivan Moreno', wonMatchesCount: 3, lostMatchesCount: 1, side: 'derecha' },
      { displayName: 'Joel Campos', wonMatchesCount: 2, lostMatchesCount: 2, side: 'reves' },
      { displayName: 'Mario Roca', wonMatchesCount: 2, lostMatchesCount: 3, side: 'derecha' },
      { displayName: 'Nico Suarez', wonMatchesCount: 1, lostMatchesCount: 2, side: 'ambas' },
      { displayName: 'Oscar Mena', wonMatchesCount: 3, lostMatchesCount: 0, side: 'derecha' },
    ],
  },
  {
    teamId: 'barbaridad',
    teamName: 'Barbaridad',
    teamLogoPath: '/teams_logos/barbarida_no_bg.png',
    players: [
      { displayName: 'Ruben Romero', wonMatchesCount: 3, lostMatchesCount: 2, side: 'derecha' },
      { displayName: 'Tomas Belda', wonMatchesCount: 2, lostMatchesCount: 1, side: 'reves' },
      { displayName: 'Julen Vives', wonMatchesCount: 1, lostMatchesCount: 3, side: 'derecha' },
      { displayName: 'Adrian Giner', wonMatchesCount: 2, lostMatchesCount: 2, side: 'reves' },
      { displayName: 'Cesar Millan', wonMatchesCount: 1, lostMatchesCount: 1, side: 'ambas' },
      { displayName: 'Dani Saez', wonMatchesCount: 0, lostMatchesCount: 2, side: 'derecha' },
    ],
  },
  {
    teamId: 'magic-city',
    teamName: 'Magic City',
    teamLogoPath: '/teams_logos/magic_ng_bg.png',
    players: [
      { displayName: 'Pablo Vidal', wonMatchesCount: 3, lostMatchesCount: 1, side: 'reves' },
      { displayName: 'Eric Cervera', wonMatchesCount: 2, lostMatchesCount: 2, side: 'derecha' },
      { displayName: 'Guille Pastor', wonMatchesCount: 1, lostMatchesCount: 2, side: 'reves' },
      { displayName: 'Jorge Canto', wonMatchesCount: 1, lostMatchesCount: 3, side: 'derecha' },
      { displayName: 'Kevin Serra', wonMatchesCount: 2, lostMatchesCount: 0, side: 'ambas' },
      { displayName: 'Lucas Soria', wonMatchesCount: 0, lostMatchesCount: 2, side: 'reves' },
    ],
  },
  {
    teamId: 'house-perez',
    teamName: 'House Perez',
    teamLogoPath: null,
    players: [
      { displayName: 'Adrian Perez', wonMatchesCount: 2, lostMatchesCount: 3, side: 'derecha' },
      { displayName: 'Samuel Roca', wonMatchesCount: 1, lostMatchesCount: 3, side: 'reves' },
      { displayName: 'Victor Navas', wonMatchesCount: 1, lostMatchesCount: 2, side: 'derecha' },
      { displayName: 'Yago Cuesta', wonMatchesCount: 0, lostMatchesCount: 3, side: 'reves' },
      { displayName: 'Hector Gil', wonMatchesCount: 2, lostMatchesCount: 1, side: 'ambas' },
      { displayName: 'Ismael Pardo', wonMatchesCount: 1, lostMatchesCount: 1, side: 'derecha' },
    ],
  },
];

export const PLAYER_SEED: readonly PlayerSeed[] = TEAM_SEED.flatMap((team) => {
  return team.players.map((player, index) => ({
    id: `${team.teamId}-player-${index + 1}`,
    slug: toSlug(player.displayName),
    displayName: player.displayName,
    teamId: team.teamId,
    teamName: team.teamName,
    teamLogoPath: team.teamLogoPath,
    avatarPath: null,
    wonMatchesCount: player.wonMatchesCount,
    lostMatchesCount: player.lostMatchesCount,
    side: player.side,
  }));
});

function toSlug(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}
