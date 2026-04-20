import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { render, screen, waitFor } from '@testing-library/angular';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeMatchdayDetailPageComponent } from './backoffice-matchday-detail-page.component';

function createLineupsStoreMock(
  overrides: Partial<Pick<BackofficeLineupsStore, 'lineups' | 'pairs'>> = {},
) {
  const matches = signal([
    {
      id: 'match-1',
      matchdayId: 'matchday-1',
      localTeamId: 'team-1',
      awayTeamId: 'team-2',
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
      scheduledAt: new Date('2026-03-25T18:00:00.000Z'),
      status: 'in_progress' as const,
    },
  ]);
  const lineups =
    overrides.lineups ??
    signal([
      { id: 'lineup-1', matchId: 'match-1', teamId: 'team-1', status: 'submited' as const },
      { id: 'lineup-2', matchId: 'match-1', teamId: 'team-2', status: 'submited' as const },
    ]);
  const pairs =
    overrides.pairs ??
    signal([
      {
        id: 'pair-1',
        lineupId: 'lineup-1',
        player1Id: 'player-1',
        player2Id: 'player-2',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
      {
        id: 'pair-2',
        lineupId: 'lineup-2',
        player1Id: 'player-3',
        player2Id: 'player-4',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
      {
        id: 'pair-3',
        lineupId: 'lineup-1',
        player1Id: 'player-5',
        player2Id: 'player-6',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
      {
        id: 'pair-4',
        lineupId: 'lineup-2',
        player1Id: 'player-7',
        player2Id: 'player-8',
        totalPlayersValue: 100,
        wonGame: null,
        sets: [],
      },
    ]);

  return {
    matches,
    lineups,
    pairs,
    isLoading: signal(false),
    isSubmittingLineup: signal(false),
    errorMessage: signal<string | null>(null),
    hasContent: signal(true),
    loadForMatchday: jest.fn().mockResolvedValue(undefined),
    loadForMatchdayAndTeam: jest.fn().mockResolvedValue(undefined),
    submitDraft: jest.fn().mockResolvedValue(undefined),
    lineupForMatch: jest.fn((matchId: string, teamId: string) =>
      lineups().find((lineup) => lineup.matchId === matchId && lineup.teamId === teamId),
    ),
    pairsForLineup: jest.fn((lineupId: string) =>
      pairs().filter((pair) => pair.lineupId === lineupId),
    ),
  } satisfies Pick<
    BackofficeLineupsStore,
    | 'matches'
    | 'lineups'
    | 'pairs'
    | 'isLoading'
    | 'isSubmittingLineup'
    | 'errorMessage'
    | 'hasContent'
    | 'loadForMatchday'
    | 'loadForMatchdayAndTeam'
    | 'submitDraft'
    | 'lineupForMatch'
    | 'pairsForLineup'
  >;
}

function createMatchdaysStoreMock(matchStatus: 'scheduled' | 'in_progress' = 'in_progress') {
  return {
    matchdays: signal([
      {
        id: 'matchday-1',
        name: 'Jornada 1',
        scheduledAt: '2026-03-25T18:00:00.000Z',
        seasonId: 'season-1',
        status: matchStatus,
      },
    ]),
    isLoading: signal(false),
    errorMessage: signal<string | null>(null),
    hasContent: signal(true),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficeMatchdaysStore,
    'matchdays' | 'isLoading' | 'errorMessage' | 'hasContent' | 'load'
  >;
}

function createTeamsStoreMock() {
  return {
    teams: signal([
      { id: 'team-1', name: 'Locales', description: '', secondaryDescription: '', logo: null },
      { id: 'team-2', name: 'Visitantes', description: '', secondaryDescription: '', logo: null },
    ]),
    isLoading: signal(false),
    errorMessage: signal<string | null>(null),
    hasContent: signal(true),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficeTeamsStore,
    'teams' | 'isLoading' | 'errorMessage' | 'hasContent' | 'load'
  >;
}

function createPlayersStoreMock() {
  return {
    players: signal([
      {
        id: 'player-1',
        firstName: 'Adri',
        lastName: 'Uno',
        email: 'adri@example.com',
        teamId: 'team-1',
        isPresident: false,
        preferredPosition: 'right' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-2',
        firstName: 'Beto',
        lastName: 'Dos',
        email: 'beto@example.com',
        teamId: 'team-1',
        isPresident: false,
        preferredPosition: 'left' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-3',
        firstName: 'Ciro',
        lastName: 'Tres',
        email: 'ciro@example.com',
        teamId: 'team-2',
        isPresident: false,
        preferredPosition: 'right' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-4',
        firstName: 'Dani',
        lastName: 'Cuatro',
        email: 'dani@example.com',
        teamId: 'team-2',
        isPresident: false,
        preferredPosition: 'left' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-5',
        firstName: 'Eli',
        lastName: 'Cinco',
        email: 'eli@example.com',
        teamId: 'team-1',
        isPresident: false,
        preferredPosition: 'right' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-6',
        firstName: 'Fede',
        lastName: 'Seis',
        email: 'fede@example.com',
        teamId: 'team-1',
        isPresident: false,
        preferredPosition: 'left' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-7',
        firstName: 'Gabi',
        lastName: 'Siete',
        email: 'gabi@example.com',
        teamId: 'team-2',
        isPresident: false,
        preferredPosition: 'right' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
      {
        id: 'player-8',
        firstName: 'Hugo',
        lastName: 'Ocho',
        email: 'hugo@example.com',
        teamId: 'team-2',
        isPresident: false,
        preferredPosition: 'left' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
    ]),
    isLoading: signal(false),
    errorMessage: signal<string | null>(null),
    hasContent: signal(true),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficePlayersStore,
    'players' | 'isLoading' | 'errorMessage' | 'hasContent' | 'load'
  >;
}

function createAdminOperationsStoreMock(pairMatchesOverrides?: readonly unknown[]) {
  return {
    pairMatches: signal(
      (pairMatchesOverrides ?? [
        {
          id: 'pair-match-1',
          localLineUpPairId: 'pair-1',
          awayLineUpPairId: 'pair-2',
          status: 'scheduled' as const,
          setsResult: [],
        },
        {
          id: 'pair-match-2',
          localLineUpPairId: 'pair-3',
          awayLineUpPairId: 'pair-4',
          status: 'scheduled' as const,
          setsResult: [],
        },
      ]) as never[],
    ),
    isLoadingPairMatches: signal(false),
    pairMatchesErrorMessage: signal<string | null>(null),
    isCreatingMatchday: signal(false),
    isPreparingBaseLineups: signal(false),
    isStartingMatchday: signal(false),
    isFinishingMatchday: signal(false),
    isCreatingPairMatches: signal(false),
    isCreatingMatch: signal(false),
    matchActionIds: signal<Record<string, 'starting' | 'finishing'>>({}),
    pairMatchActionIds: signal<Record<string, 'finishing'>>({}),
    loadPairMatches: jest.fn().mockResolvedValue(undefined),
    prepareBaseLineups: jest.fn().mockResolvedValue(undefined),
    startMatchday: jest.fn().mockResolvedValue(undefined),
    finishMatchday: jest.fn().mockResolvedValue(undefined),
    createPairMatches: jest.fn().mockResolvedValue(undefined),
    createMatch: jest.fn().mockResolvedValue(true),
    startMatch: jest.fn().mockResolvedValue(undefined),
    finishMatch: jest.fn().mockResolvedValue(undefined),
    finishPairMatch: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficeAdminMatchdayOperationsStore,
    | 'pairMatches'
    | 'isLoadingPairMatches'
    | 'pairMatchesErrorMessage'
    | 'isCreatingMatchday'
    | 'isPreparingBaseLineups'
    | 'isStartingMatchday'
    | 'isFinishingMatchday'
    | 'isCreatingPairMatches'
    | 'isCreatingMatch'
    | 'matchActionIds'
    | 'pairMatchActionIds'
    | 'loadPairMatches'
    | 'prepareBaseLineups'
    | 'startMatchday'
    | 'finishMatchday'
    | 'createPairMatches'
    | 'createMatch'
    | 'startMatch'
    | 'finishMatch'
    | 'finishPairMatch'
  >;
}

async function renderComponent(options: {
  role: 'ADMIN' | 'PRESIDENT';
  lineupsStore?: ReturnType<typeof createLineupsStoreMock>;
  adminOperationsStore?: ReturnType<typeof createAdminOperationsStoreMock>;
  matchdaysStore?: ReturnType<typeof createMatchdaysStoreMock>;
}) {
  const lineupsStore = options.lineupsStore ?? createLineupsStoreMock();
  const adminOperationsStore = options.adminOperationsStore ?? createAdminOperationsStoreMock();

  return render(BackofficeMatchdayDetailPageComponent, {
    providers: [
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: {
              get: (key: string) => (key === 'matchdayId' ? 'matchday-1' : null),
            },
          },
        },
      },
      {
        provide: BackofficeSessionStore,
        useValue: {
          currentRole: signal(options.role),
          currentPresidentTeamId: signal(options.role === 'PRESIDENT' ? 'team-1' : null),
        } satisfies Pick<BackofficeSessionStore, 'currentPresidentTeamId' | 'currentRole'>,
      },
      { provide: BackofficeLineupsStore, useValue: lineupsStore },
      {
        provide: BackofficeMatchdaysStore,
        useValue: options.matchdaysStore ?? createMatchdaysStoreMock(),
      },
      { provide: BackofficeTeamsStore, useValue: createTeamsStoreMock() },
      { provide: BackofficePlayersStore, useValue: createPlayersStoreMock() },
      { provide: BackofficeAdminMatchdayOperationsStore, useValue: adminOperationsStore },
      {
        provide: ActionToastStore,
        useValue: { success: jest.fn(), error: jest.fn() },
      },
    ],
  });
}

describe('BackofficeMatchdayDetailPageComponent', () => {
  it('loads the president view with the narrowed matchday-team query and hides admin actions', async () => {
    const lineupsStore = createLineupsStoreMock();

    await renderComponent({ role: 'PRESIDENT', lineupsStore });

    await waitFor(() => {
      expect(lineupsStore.loadForMatchdayAndTeam).toHaveBeenCalledWith(
        'matchday-1',
        'team-1',
        false,
      );
    });

    expect(screen.queryByRole('button', { name: /Nuevo partido/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Gestionar alineación/i })).toBeVisible();

    screen.getByRole('button', { name: /Gestionar alineación/i }).click();

    expect(
      await screen.findByText('Esta alineación ya fue enviada y se muestra en modo lectura.'),
    ).toBeVisible();
  });

  it('shows the new admin controls and blocks finishing a match without all pair results', async () => {
    const adminOperationsStore = createAdminOperationsStoreMock([
      {
        id: 'pair-match-1',
        localLineUpPairId: 'pair-1',
        awayLineUpPairId: 'pair-2',
        status: 'scheduled' as const,
        setsResult: [],
      },
      {
        id: 'pair-match-2',
        localLineUpPairId: 'pair-3',
        awayLineUpPairId: 'pair-4',
        status: 'scheduled' as const,
        setsResult: [],
      },
    ]);

    await renderComponent({ role: 'ADMIN', adminOperationsStore });

    expect(screen.getByRole('button', { name: /Preparar alineaciones base/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Gestionar alineación Locales/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Gestionar alineación Visitantes/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Generar enfrentamientos de parejas/i }),
    ).toBeDisabled();
    expect(screen.getByRole('button', { name: /^Finalizar$/i })).toBeDisabled();
    expect(
      screen.getAllByRole('button', { name: /Registrar resultado/i }).length,
    ).toBeGreaterThanOrEqual(2);
  });

  it('shows pair match results as read-only once they are registered', async () => {
    const adminOperationsStore = createAdminOperationsStoreMock([
      {
        id: 'pair-match-1',
        localLineUpPairId: 'pair-1',
        awayLineUpPairId: 'pair-2',
        status: 'finished' as const,
        setsResult: [{ local: 6, away: 4 }],
      },
      {
        id: 'pair-match-2',
        localLineUpPairId: 'pair-3',
        awayLineUpPairId: 'pair-4',
        status: 'finished' as const,
        setsResult: [{ local: 6, away: 2 }],
      },
    ]);

    await renderComponent({ role: 'ADMIN', adminOperationsStore });

    expect(screen.queryByRole('button', { name: /Registrar resultado/i })).not.toBeInTheDocument();
    expect(screen.getAllByText('Resultado cerrado.')).toHaveLength(2);
    expect(screen.getByText('6-4')).toBeVisible();
    expect(screen.getByText('6-2')).toBeVisible();
  });

  it('lets the admin intervene and submit the lineup of any team in the matchday', async () => {
    const lineupsStore = createLineupsStoreMock({
      lineups: signal([
        { id: 'lineup-1', matchId: 'match-1', teamId: 'team-1', status: 'submited' as const },
        { id: 'lineup-2', matchId: 'match-1', teamId: 'team-2', status: 'pending' as const },
      ]),
    });

    await renderComponent({ role: 'ADMIN', lineupsStore });

    screen.getByRole('button', { name: /Gestionar alineación Visitantes/i }).click();

    (await screen.findByRole('button', { name: /Enviar alineación/i })).click();

    await waitFor(() => {
      expect(lineupsStore.submitDraft).toHaveBeenCalledWith('match-1', 'team-2', [
        { player1Id: 'player-3', player2Id: 'player-4' },
        { player1Id: 'player-7', player2Id: 'player-8' },
      ]);
    });
  });
});
