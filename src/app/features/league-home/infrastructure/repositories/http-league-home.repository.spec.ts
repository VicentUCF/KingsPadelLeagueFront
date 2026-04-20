import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '@core/api/api-base-url.token';

import { HttpLeagueHomeRepository } from './http-league-home.repository';

describe('HttpLeagueHomeRepository', () => {
  let repository: HttpLeagueHomeRepository;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        HttpLeagueHomeRepository,
      ],
    });

    repository = TestBed.inject(HttpLeagueHomeRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('builds a preseason snapshot from API data and reuses the cached dataset for matchdays', async () => {
    const snapshotPromise = repository.loadSnapshot();

    flushLeagueHomeRequests({
      teams: [
        createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' }),
        createTeamHttp({ id: 'team-titanics', name: 'Titanics' }),
      ],
      players: [
        createPlayerHttp({
          id: 'player-vicent',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          isPresident: true,
          teamId: 'team-kings',
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-adrian',
          firstName: 'Adrián',
          lastName: 'Asunción',
          isPresident: true,
          teamId: 'team-titanics',
          preferredPosition: 'left',
        }),
      ],
    });

    const snapshot = await snapshotPromise;

    expect(snapshot.currentPhase).toEqual({
      code: 'preseason',
      label: 'Pretemporada',
    });
    expect(snapshot.currentMatchday.label).toBe('Calendario pendiente de publicación');
    expect(snapshot.teams.map((team) => team.slug)).toEqual(['kings-of-favar', 'titanics']);
    expect(snapshot.teamProfiles[0]).toEqual(
      expect.objectContaining({
        slug: 'kings-of-favar',
        presidentName: 'Vicent Ciscar',
      }),
    );
    expect(snapshot.standings).toEqual([
      expect.objectContaining({ teamName: 'Kings Of Favar', points: 0, playedMatches: 0 }),
      expect.objectContaining({ teamName: 'Titanics', points: 0, playedMatches: 0 }),
    ]);

    await expect(repository.loadMatchdays()).resolves.toEqual([]);
    httpTestingController.expectNone((request) => request.url.startsWith('http://api.test/v1/'));
  });

  it('maps finished matchdays, pair results and standings from the API dataset', async () => {
    const matchdaysPromise = repository.loadMatchdays();

    flushLeagueHomeRequests({
      teams: [
        createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' }),
        createTeamHttp({ id: 'team-titanics', name: 'Titanics' }),
      ],
      players: [
        createPlayerHttp({
          id: 'player-vicent',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          teamId: 'team-kings',
          isPresident: true,
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-enric',
          firstName: 'Enric',
          lastName: 'Bixquert',
          teamId: 'team-kings',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-adrian',
          firstName: 'Adrián',
          lastName: 'Asunción',
          teamId: 'team-titanics',
          isPresident: true,
          preferredPosition: 'left',
        }),
        createPlayerHttp({
          id: 'player-brigante',
          firstName: 'Carlos',
          lastName: 'Brigante',
          teamId: 'team-titanics',
          preferredPosition: 'right',
        }),
      ],
      matchdays: [
        createMatchdayHttp({
          id: 'matchday-1',
          name: 'Jornada 1',
          scheduledAt: '2026-03-15T17:00:00.000Z',
          status: 'finished',
        }),
      ],
      matches: [
        createMatchHttp({
          id: 'match-1',
          matchdayId: 'matchday-1',
          localTeamId: 'team-kings',
          awayTeamId: 'team-titanics',
          localTeamScorePoints: 2,
          awayTeamScorePoints: 0,
          scheduledAt: '2026-03-15T17:00:00.000Z',
        }),
      ],
      lineups: [
        createLineupHttp({ id: 'lineup-kings', matchId: 'match-1', teamId: 'team-kings' }),
        createLineupHttp({ id: 'lineup-titanics', matchId: 'match-1', teamId: 'team-titanics' }),
      ],
      lineupPairs: [
        createLineupPairHttp({
          id: 'pair-kings-1',
          matchTeamLineUpId: 'lineup-kings',
          player1Id: 'player-vicent',
          player2Id: 'player-enric',
        }),
        createLineupPairHttp({
          id: 'pair-titanics-1',
          matchTeamLineUpId: 'lineup-titanics',
          player1Id: 'player-adrian',
          player2Id: 'player-brigante',
        }),
      ],
      pairMatches: [
        createPairMatchHttp({
          id: 'pair-match-1',
          localLineUpPairId: 'pair-kings-1',
          awayLineUpPairId: 'pair-titanics-1',
          status: 'finished',
          setsResult: [
            { local: 6, away: 4 },
            { local: 6, away: 3 },
          ],
        }),
      ],
    });

    const matchdays = await matchdaysPromise;

    expect(matchdays).toHaveLength(1);
    expect(matchdays[0]).toEqual(
      expect.objectContaining({
        id: 'matchday-1',
        number: 1,
        status: 'completed',
      }),
    );
    expect(matchdays[0]?.encounters[0]).toEqual(
      expect.objectContaining({
        id: 'match-1',
        homeTeamName: 'Kings Of Favar',
        awayTeamName: 'Titanics',
        homeScore: 2,
        awayScore: 0,
      }),
    );
    expect(matchdays[0]?.encounters[0]?.pairResults[0]).toEqual(
      expect.objectContaining({
        label: 'Pareja 1',
        homePair: expect.objectContaining({
          label: 'Pareja 1',
        }),
        awayPair: expect.objectContaining({
          label: 'Pareja 1',
        }),
        winnerTeamId: 'team-kings',
        homeScoreLabel: '6/4 · 6/3',
        awayScoreLabel: '4/6 · 3/6',
      }),
    );

    const snapshot = await repository.loadSnapshot();
    expect(snapshot.lastResults[0]).toEqual(
      expect.objectContaining({
        id: 'match-1',
        winnerTeamName: 'Kings Of Favar',
        homePoints: 2,
        awayPoints: 0,
      }),
    );
    expect(snapshot.standings[0]).toEqual(
      expect.objectContaining({
        teamId: 'team-kings',
        points: 2,
        playedMatches: 1,
        gameDifference: 5,
      }),
    );
  });

  it('keeps the public encounter score tied to the match payload when pair results and match points disagree', async () => {
    const matchdaysPromise = repository.loadMatchdays();

    flushLeagueHomeRequests({
      teams: [
        createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' }),
        createTeamHttp({ id: 'team-magic', name: 'Magic City' }),
      ],
      players: [
        createPlayerHttp({
          id: 'player-kings-1',
          firstName: 'Raul',
          lastName: 'Bataller',
          teamId: 'team-kings',
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-kings-2',
          firstName: 'Tono',
          lastName: 'Miñana',
          teamId: 'team-kings',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-kings-3',
          firstName: 'Vicent',
          lastName: 'Ciscar',
          teamId: 'team-kings',
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-kings-4',
          firstName: 'Jose',
          lastName: 'Sanfelix',
          teamId: 'team-kings',
          preferredPosition: 'left',
        }),
        createPlayerHttp({
          id: 'player-magic-1',
          firstName: 'Ruben',
          lastName: 'Marzal',
          teamId: 'team-magic',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-2',
          firstName: 'Adri',
          lastName: 'Alvarez',
          teamId: 'team-magic',
          preferredPosition: 'left',
        }),
        createPlayerHttp({
          id: 'player-magic-3',
          firstName: 'Josep',
          lastName: 'Castello',
          teamId: 'team-magic',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-4',
          firstName: 'Artur',
          lastName: 'Peris',
          teamId: 'team-magic',
          preferredPosition: 'left',
        }),
      ],
      matchdays: [
        createMatchdayHttp({
          id: 'matchday-1',
          name: 'Jornada 1',
          scheduledAt: '2026-04-19T16:00:00.000Z',
          status: 'finished',
        }),
      ],
      matches: [
        createMatchHttp({
          id: 'match-1',
          matchdayId: 'matchday-1',
          localTeamId: 'team-kings',
          awayTeamId: 'team-magic',
          localTeamScorePoints: 0,
          awayTeamScorePoints: 0,
          status: 'finished',
          scheduledAt: '2026-04-19T16:00:00.000Z',
        }),
      ],
      lineups: [
        createLineupHttp({ id: 'lineup-kings', matchId: 'match-1', teamId: 'team-kings' }),
        createLineupHttp({ id: 'lineup-magic', matchId: 'match-1', teamId: 'team-magic' }),
      ],
      lineupPairs: [
        createLineupPairHttp({
          id: 'pair-kings-1',
          matchTeamLineUpId: 'lineup-kings',
          player1Id: 'player-kings-1',
          player2Id: 'player-kings-2',
        }),
        createLineupPairHttp({
          id: 'pair-kings-2',
          matchTeamLineUpId: 'lineup-kings',
          player1Id: 'player-kings-3',
          player2Id: 'player-kings-4',
        }),
        createLineupPairHttp({
          id: 'pair-magic-1',
          matchTeamLineUpId: 'lineup-magic',
          player1Id: 'player-magic-1',
          player2Id: 'player-magic-2',
        }),
        createLineupPairHttp({
          id: 'pair-magic-2',
          matchTeamLineUpId: 'lineup-magic',
          player1Id: 'player-magic-3',
          player2Id: 'player-magic-4',
        }),
      ],
      pairMatches: [
        createPairMatchHttp({
          id: 'pair-match-1',
          localLineUpPairId: 'pair-kings-1',
          awayLineUpPairId: 'pair-magic-1',
          status: 'finished',
          setsResult: [
            { local: 6, away: 4 },
            { local: 6, away: 3 },
          ],
        }),
      ],
    });

    const matchdays = await matchdaysPromise;
    const [encounter] = matchdays[0]?.encounters ?? [];

    expect(encounter).toEqual(
      expect.objectContaining({
        status: 'completed',
        homeScore: 0,
        awayScore: 0,
      }),
    );
  });

  it('resolves the pair winner from valid set objects even when pair-match status is missing', async () => {
    const matchdaysPromise = repository.loadMatchdays();

    flushLeagueHomeRequests({
      teams: [
        createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' }),
        createTeamHttp({ id: 'team-magic', name: 'Magic City' }),
      ],
      players: [
        createPlayerHttp({
          id: 'player-kings-1',
          firstName: 'Raul',
          lastName: 'Bataller',
          teamId: 'team-kings',
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-kings-2',
          firstName: 'Tono',
          lastName: 'Miñana',
          teamId: 'team-kings',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-1',
          firstName: 'Ruben',
          lastName: 'Marzal',
          teamId: 'team-magic',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-2',
          firstName: 'Adri',
          lastName: 'Alvarez',
          teamId: 'team-magic',
          preferredPosition: 'left',
        }),
      ],
      matchdays: [
        createMatchdayHttp({
          id: 'matchday-1',
          name: 'Jornada 1',
          status: 'finished',
        }),
      ],
      matches: [
        createMatchHttp({
          id: 'match-1',
          matchdayId: 'matchday-1',
          localTeamId: 'team-kings',
          awayTeamId: 'team-magic',
          localTeamScorePoints: 0,
          awayTeamScorePoints: 0,
          status: 'finished',
        }),
      ],
      lineups: [
        createLineupHttp({ id: 'lineup-kings', matchId: 'match-1', teamId: 'team-kings' }),
        createLineupHttp({ id: 'lineup-magic', matchId: 'match-1', teamId: 'team-magic' }),
      ],
      lineupPairs: [
        createLineupPairHttp({
          id: 'pair-kings-1',
          matchTeamLineUpId: 'lineup-kings',
          player1Id: 'player-kings-1',
          player2Id: 'player-kings-2',
        }),
        createLineupPairHttp({
          id: 'pair-magic-1',
          matchTeamLineUpId: 'lineup-magic',
          player1Id: 'player-magic-1',
          player2Id: 'player-magic-2',
        }),
      ],
      pairMatches: [
        createPairMatchHttp({
          id: 'pair-match-1',
          localLineUpPairId: 'pair-kings-1',
          awayLineUpPairId: 'pair-magic-1',
          status: null,
          setsResult: [
            { local: 6, away: 4 },
            { local: 6, away: 3 },
          ],
        }),
      ],
    });

    const matchdays = await matchdaysPromise;
    const pairResult = matchdays[0]?.encounters[0]?.pairResults[0];

    expect(pairResult).toEqual(
      expect.objectContaining({
        homeScoreLabel: '6/4 · 6/3',
        awayScoreLabel: '4/6 · 3/6',
        winnerTeamId: 'team-kings',
      }),
    );
  });

  it('treats malformed pair-match set payloads as unpublished results instead of rendering broken scores', async () => {
    const matchdaysPromise = repository.loadMatchdays();

    flushLeagueHomeRequests({
      teams: [
        createTeamHttp({ id: 'team-kings', name: 'Kings Of Favar' }),
        createTeamHttp({ id: 'team-magic', name: 'Magic City' }),
      ],
      players: [
        createPlayerHttp({
          id: 'player-kings-1',
          firstName: 'Raul',
          lastName: 'Bataller',
          teamId: 'team-kings',
          preferredPosition: 'both',
        }),
        createPlayerHttp({
          id: 'player-kings-2',
          firstName: 'Tono',
          lastName: 'Miñana',
          teamId: 'team-kings',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-1',
          firstName: 'Ruben',
          lastName: 'Marzal',
          teamId: 'team-magic',
          preferredPosition: 'right',
        }),
        createPlayerHttp({
          id: 'player-magic-2',
          firstName: 'Adri',
          lastName: 'Alvarez',
          teamId: 'team-magic',
          preferredPosition: 'left',
        }),
      ],
      matchdays: [
        createMatchdayHttp({
          id: 'matchday-1',
          name: 'Jornada 1',
          status: 'finished',
        }),
      ],
      matches: [
        createMatchHttp({
          id: 'match-1',
          matchdayId: 'matchday-1',
          localTeamId: 'team-kings',
          awayTeamId: 'team-magic',
          localTeamScorePoints: 0,
          awayTeamScorePoints: 0,
          status: 'finished',
        }),
      ],
      lineups: [
        createLineupHttp({ id: 'lineup-kings', matchId: 'match-1', teamId: 'team-kings' }),
        createLineupHttp({ id: 'lineup-magic', matchId: 'match-1', teamId: 'team-magic' }),
      ],
      lineupPairs: [
        createLineupPairHttp({
          id: 'pair-kings-1',
          matchTeamLineUpId: 'lineup-kings',
          player1Id: 'player-kings-1',
          player2Id: 'player-kings-2',
        }),
        createLineupPairHttp({
          id: 'pair-magic-1',
          matchTeamLineUpId: 'lineup-magic',
          player1Id: 'player-magic-1',
          player2Id: 'player-magic-2',
        }),
      ],
      pairMatches: [
        createPairMatchHttp({
          id: 'pair-match-1',
          localLineUpPairId: 'pair-kings-1',
          awayLineUpPairId: 'pair-magic-1',
          status: null,
          setsResult: [[], []],
        }),
      ],
    });

    const matchdays = await matchdaysPromise;
    const pairResult = matchdays[0]?.encounters[0]?.pairResults[0];

    expect(pairResult).toEqual(
      expect.objectContaining({
        homeScoreLabel: 'Pendiente',
        awayScoreLabel: 'Pendiente',
        winnerTeamId: null,
        homePair: expect.objectContaining({
          label: 'Pareja 1',
        }),
        awayPair: expect.objectContaining({
          label: 'Pareja 1',
        }),
      }),
    );
  });

  function flushLeagueHomeRequests({
    teams,
    players,
    matchdays = [],
    matches = [],
    lineups = [],
    lineupPairs = [],
    pairMatches = [],
  }: {
    teams: unknown[];
    players: unknown[];
    matchdays?: unknown[];
    matches?: unknown[];
    lineups?: unknown[];
    lineupPairs?: unknown[];
    pairMatches?: unknown[];
  }): void {
    expectCollectionRequest('/v1/teams', '100').flush({
      items: teams,
      meta: createMeta(teams.length),
    });
    expectCollectionRequest('/v1/players', '200').flush({
      items: players,
      meta: createMeta(players.length),
    });
    expectCollectionRequest('/v1/matchdays', '100').flush({
      items: matchdays,
      meta: createMeta(matchdays.length),
    });
    expectCollectionRequest('/v1/matches', '200').flush({
      items: matches,
      meta: createMeta(matches.length),
    });
    expectCollectionRequest('/v1/match-team-line-ups', '200').flush({
      items: lineups,
      meta: createMeta(lineups.length),
    });
    expectCollectionRequest('/v1/match-team-line-up-pairs', '200').flush({
      items: lineupPairs,
      meta: createMeta(lineupPairs.length),
    });
    expectCollectionRequest('/v1/pair-matches', '200').flush({
      items: pairMatches,
      meta: createMeta(pairMatches.length),
    });
  }

  function expectCollectionRequest(path: string, limit: string) {
    return httpTestingController.expectOne((request) => {
      return request.url === `http://api.test${path}` && request.params.get('limit') === limit;
    });
  }
});

function createMeta(itemCount: number) {
  return {
    currentPage: 1,
    itemCount,
    itemsPerPage: Math.max(itemCount, 1),
    totalItems: itemCount,
    totalPages: itemCount > 0 ? 1 : 0,
  };
}

function createTeamHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'team-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    description: 'Description',
    secondaryDescription: 'Secondary description',
    logo: 'https://cdn.test/team.png',
    name: 'Equipo Demo',
    ...overrides,
  };
}

function createPlayerHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'player-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    firstName: 'Jugador',
    lastName: 'Demo',
    email: 'demo@example.com',
    description: 'Perfil oficial',
    profileImage: 'https://cdn.test/player.png',
    isPresident: false,
    value: 0,
    wonGames: 0,
    lostGames: 0,
    preferredPosition: 'right',
    ...overrides,
  };
}

function createMatchdayHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'matchday-id',
    name: 'Jornada 1',
    scheduledAt: '2026-03-15T17:00:00.000Z',
    seasonId: 'season-1',
    status: 'scheduled',
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  };
}

function createMatchHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'match-id',
    matchdayId: 'matchday-id',
    localTeamId: 'team-local',
    awayTeamId: 'team-away',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: '2026-03-15T17:00:00.000Z',
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  };
}

function createLineupHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lineup-id',
    matchId: 'match-id',
    teamId: 'team-id',
    status: 'submited',
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  };
}

function createLineupPairHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'lineup-pair-id',
    matchTeamLineUpId: 'lineup-id',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 0,
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  };
}

function createPairMatchHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'pair-match-id',
    localLineUpPairId: 'local-pair-id',
    awayLineUpPairId: 'away-pair-id',
    status: 'scheduled',
    createdAt: '2026-03-17T10:00:00.000Z',
    ...overrides,
  };
}
