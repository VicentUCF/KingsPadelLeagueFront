import { type PlayerCardViewModel } from './player-directory.viewmodel';

export const ALL_PLAYER_DIRECTORY_TEAMS = 'all-teams';
export const ALL_PLAYER_DIRECTORY_SIDES = 'all-sides';

export type PlayerDirectorySideFilter =
  | PlayerCardViewModel['side']
  | typeof ALL_PLAYER_DIRECTORY_SIDES;

export interface PlayerDirectoryFilters {
  readonly query: string;
  readonly side: PlayerDirectorySideFilter;
  readonly teamName: string;
}

export interface PlayerDirectoryFilterOption {
  readonly label: string;
  readonly value: string;
}

export const PLAYER_DIRECTORY_SIDE_OPTIONS: readonly PlayerDirectoryFilterOption[] = [
  { label: 'Todos los lados', value: ALL_PLAYER_DIRECTORY_SIDES },
  { label: 'Derecha', value: 'derecha' },
  { label: 'Revés', value: 'reves' },
  { label: 'Ambas', value: 'ambas' },
];

export function filterPlayerDirectoryCards(
  players: readonly PlayerCardViewModel[],
  filters: PlayerDirectoryFilters,
): readonly PlayerCardViewModel[] {
  const searchTerms = normalize(filters.query).split(/\s+/).filter(Boolean);
  const normalizedTeamName = normalize(filters.teamName);

  return players.filter((player) => {
    if (
      filters.teamName !== ALL_PLAYER_DIRECTORY_TEAMS &&
      normalize(player.teamName) !== normalizedTeamName
    ) {
      return false;
    }

    if (filters.side !== ALL_PLAYER_DIRECTORY_SIDES && player.side !== filters.side) {
      return false;
    }

    if (searchTerms.length === 0) {
      return true;
    }

    return matchesSearch(player, searchTerms);
  });
}

export function buildPlayerTeamFilterOptions(
  players: readonly Pick<PlayerCardViewModel, 'teamName'>[],
): readonly PlayerDirectoryFilterOption[] {
  const teamNames = [...new Set(players.map((player) => player.teamName))].sort((left, right) =>
    left.localeCompare(right),
  );

  return [
    { label: 'Todos los equipos', value: ALL_PLAYER_DIRECTORY_TEAMS },
    ...teamNames.map((teamName) => ({ label: teamName, value: teamName })),
  ];
}

export function coercePlayerDirectorySideFilter(value: string): PlayerDirectorySideFilter {
  return PLAYER_DIRECTORY_SIDE_OPTIONS.some((option) => option.value === value)
    ? (value as PlayerDirectorySideFilter)
    : ALL_PLAYER_DIRECTORY_SIDES;
}

export function getPlayerDirectorySearchPlaceholder(): string {
  return 'Buscar por nombre, equipo, lado o estadísticas…';
}

function matchesSearch(player: PlayerCardViewModel, searchTerms: readonly string[]): boolean {
  return searchTerms.every((term) =>
    getSearchableValues(player).some((value) => normalize(value).includes(term)),
  );
}

function getSearchableValues(player: PlayerCardViewModel): readonly string[] {
  return [
    player.displayName,
    player.teamName,
    player.side,
    player.sideLabel,
    `${player.ranking}`,
    player.wonMatchesLabel,
    player.lostMatchesLabel,
    `${player.playedMatchesCount}`,
    player.winRateLabel,
    `${player.winRate}`,
  ];
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}
