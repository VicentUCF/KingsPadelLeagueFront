import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import { toLeagueHomeViewModel } from './league-home.viewmodel';

describe('toLeagueHomeViewModel', () => {
  it('maps standings entries to premium leaderboard tones and team detail links', () => {
    const viewModel = toLeagueHomeViewModel(createSnapshot());

    expect(viewModel.standings).toEqual([
      expect.objectContaining({
        teamName: 'House Navarro',
        rankTone: 'leader',
        gameDifferenceTone: 'positive',
        logoPath: null,
        teamLink: '/equipos/house-navarro',
      }),
      expect.objectContaining({
        teamName: 'House Torres',
        rankTone: 'podium',
        gameDifferenceTone: 'neutral',
        logoPath: null,
      }),
      expect.objectContaining({
        teamName: 'House Perez',
        rankTone: 'standard',
        gameDifferenceTone: 'negative',
        logoPath: null,
      }),
    ]);
  });

  it('maps uploaded team logos when the team name matches the branding registry', () => {
    const snapshot = createSnapshot({
      standings: [createStandingEntry('titanics', 'Titanics', 1, 11, 2, 12)],
      teams: [createTeamSummary('magic-city', 'magic-city', 'Magic City', 'Vidal')],
      teamProfiles: [createTeamProfile('magic-city', 'magic-city', 'Magic City', 'Vidal')],
    });

    const viewModel = toLeagueHomeViewModel(snapshot);

    expect(viewModel.standings[0]).toEqual(
      expect.objectContaining({
        teamName: 'Titanics',
        logoPath: '/teams_logos/titanics_no_bg.png',
      }),
    );
    expect(viewModel.teams[0]).toEqual(
      expect.objectContaining({
        name: 'Magic City',
        logoPath: '/teams_logos/magic_ng_bg.png',
        teamLink: '/equipos/magic-city',
      }),
    );
  });

  it('keeps the standings neutral and omits the bye card when no calendar is published yet', () => {
    const viewModel = toLeagueHomeViewModel({
      ...createSnapshot(),
      currentMatchday: {
        current: 0,
        total: 0,
        label: 'Por anunciar',
      },
      standings: [
        createStandingEntry('titanics', 'Titanics', 1, 0, 0, 0),
        createStandingEntry('magic-city', 'Magic City', 2, 0, 0, 0),
      ],
      nextMatches: [],
      byeTeam: null,
      lastResults: [],
      teams: [
        createTeamSummary('titanics', 'titanics', 'Titanics', 'Torres'),
        createTeamSummary('magic-city', 'magic-city', 'Magic City', 'Vidal'),
      ],
      teamProfiles: [
        createTeamProfile('titanics', 'titanics', 'Titanics', 'Torres'),
        createTeamProfile('magic-city', 'magic-city', 'Magic City', 'Vidal'),
      ],
    } as unknown as LeagueHomeSnapshot);

    expect(viewModel.byeTeam).toBeNull();
    expect(viewModel.nextMatches).toEqual([]);
    expect(viewModel.lastResults).toEqual([]);
    expect(viewModel.standings).toEqual([
      expect.objectContaining({
        teamName: 'Titanics',
        rankTone: 'standard',
        gameDifferenceTone: 'neutral',
        isLeader: false,
        isLast: false,
      }),
      expect.objectContaining({
        teamName: 'Magic City',
        rankTone: 'standard',
        gameDifferenceTone: 'neutral',
        isLeader: false,
        isLast: false,
      }),
    ]);
  });
});

function createSnapshot(overrides: Partial<LeagueHomeSnapshot> = {}): LeagueHomeSnapshot {
  return {
    league: {
      name: 'KingsPadelLeague',
      tagline: 'Liga amateur de pádel por equipos con formato competitivo.',
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
    nextMatches: [],
    byeTeam: {
      teamId: 'house-vidal',
      teamName: 'House Vidal',
      matchdayLabel: 'Jornada 3',
    },
    standings: [
      createStandingEntry('house-navarro', 'House Navarro', 1, 11, 2, 12),
      createStandingEntry('house-torres', 'House Torres', 2, 9, 2, 0),
      createStandingEntry('house-perez', 'House Perez', 5, 3, 2, -7),
    ],
    lastResults: [],
    teams: [
      createTeamSummary('house-navarro', 'house-navarro', 'House Navarro', 'Navarro'),
      createTeamSummary('house-torres', 'house-torres', 'House Torres', 'Torres'),
      createTeamSummary('house-perez', 'house-perez', 'House Perez', 'Perez'),
    ],
    teamProfiles: [
      createTeamProfile('house-navarro', 'house-navarro', 'House Navarro', 'Navarro'),
      createTeamProfile('house-torres', 'house-torres', 'House Torres', 'Torres'),
      createTeamProfile('house-perez', 'house-perez', 'House Perez', 'Perez'),
    ],
    ...overrides,
  };
}

function createStandingEntry(
  teamId: string,
  teamName: string,
  rank: number,
  points: number,
  playedMatches: number,
  gameDifference: number,
): LeagueHomeSnapshot['standings'][number] {
  return {
    teamId,
    teamName,
    rank,
    points,
    playedMatches,
    gameDifference,
  };
}

function createTeamSummary(id: string, slug: string, name: string, presidentName: string) {
  return {
    id,
    slug,
    name,
    presidentName,
    playerCount: 6,
  };
}

function createTeamProfile(id: string, slug: string, name: string, presidentName: string) {
  return {
    id,
    slug,
    name,
    presidentName,
    tagline: `${name} tagline`,
    identityDescription: `${name} identity`,
    players: [],
  };
}
