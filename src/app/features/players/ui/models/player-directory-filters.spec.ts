import {
  ALL_PLAYER_DIRECTORY_SIDES,
  ALL_PLAYER_DIRECTORY_TEAMS,
  buildPlayerTeamFilterOptions,
  filterPlayerDirectoryCards,
  type PlayerDirectoryFilters,
} from './player-directory-filters';
import { type PlayerCardViewModel } from './player-directory.viewmodel';

describe('filterPlayerDirectoryCards', () => {
  it('filters players using accent-insensitive matching across searchable fields', () => {
    const result = filterPlayerDirectoryCards(PLAYERS, {
      ...DEFAULT_FILTERS,
      query: 'reves',
    });

    expect(result.map((player) => player.displayName)).toEqual(['Sergio Torres']);
  });

  it('combines team and side filters with the search query', () => {
    const result = filterPlayerDirectoryCards(PLAYERS, {
      ...DEFAULT_FILTERS,
      teamName: 'Titanics',
      side: 'reves',
      query: '80',
    });

    expect(result.map((player) => player.displayName)).toEqual(['Sergio Torres']);
  });
});

describe('buildPlayerTeamFilterOptions', () => {
  it('returns the default option plus alphabetically sorted teams', () => {
    expect(buildPlayerTeamFilterOptions(PLAYERS)).toEqual([
      { label: 'Todos los equipos', value: ALL_PLAYER_DIRECTORY_TEAMS },
      { label: 'Kings of Favar', value: 'Kings of Favar' },
      { label: 'Titanics', value: 'Titanics' },
    ]);
  });
});

const DEFAULT_FILTERS: PlayerDirectoryFilters = {
  query: '',
  side: ALL_PLAYER_DIRECTORY_SIDES,
  teamName: ALL_PLAYER_DIRECTORY_TEAMS,
};

const PLAYERS: readonly PlayerCardViewModel[] = [
  createPlayerCard({
    displayName: 'Alex Soler',
    ranking: 1,
    side: 'derecha',
    sideLabel: 'Derecha',
    teamName: 'Kings of Favar',
    winRate: 80,
    winRateLabel: '80%',
  }),
  createPlayerCard({
    displayName: 'Sergio Torres',
    ranking: 2,
    side: 'reves',
    sideLabel: 'Revés',
    teamName: 'Titanics',
    winRate: 80,
    winRateLabel: '80%',
  }),
];

function createPlayerCard(
  overrides: Partial<PlayerCardViewModel> & Pick<PlayerCardViewModel, 'displayName' | 'teamName'>,
): PlayerCardViewModel {
  return {
    id: overrides.displayName.toLowerCase().replace(/\s+/g, '-'),
    displayName: overrides.displayName,
    teamName: overrides.teamName,
    teamLogoPath: null,
    avatarPath: '/player-stock/avatar-01.svg',
    wonMatchesCount: overrides.wonMatchesCount ?? 4,
    lostMatchesCount: overrides.lostMatchesCount ?? 1,
    playedMatchesCount: overrides.playedMatchesCount ?? 5,
    wonMatchesLabel: overrides.wonMatchesLabel ?? '4',
    lostMatchesLabel: overrides.lostMatchesLabel ?? '1',
    profileLink: `/jugadores/${overrides.displayName.toLowerCase().replace(/\s+/g, '-')}`,
    ranking: overrides.ranking ?? 1,
    winRate: overrides.winRate ?? 80,
    winRateLabel: overrides.winRateLabel ?? '80%',
    side: overrides.side ?? 'ambas',
    sideLabel: overrides.sideLabel ?? 'Ambas',
  };
}
