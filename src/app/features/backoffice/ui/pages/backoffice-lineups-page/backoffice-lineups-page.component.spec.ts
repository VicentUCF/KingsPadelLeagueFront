import { signal } from '@angular/core';
import { render, screen } from '@testing-library/angular';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeLineupsPageComponent } from './backoffice-lineups-page.component';

interface LineupSubmissionTestApi {
  readonly selectedMatchId: { set(value: string | null): void };
  readonly plannerTeamId: { set(value: string | null): void };
  readonly plannerPairs: {
    set(
      value: readonly {
        readonly id: string;
        readonly player1Id: string;
        readonly player2Id: string;
      }[],
    ): void;
  };
  submitLineup(): Promise<void>;
}

function createLineupsStoreMock() {
  const matches = signal([
    {
      id: 'match-1',
      matchdayId: 'matchday-1',
      localTeamId: 'team-local',
      awayTeamId: 'team-away',
      localTeamScorePoints: 0,
      awayTeamScorePoints: 0,
      scheduledAt: new Date('2026-03-25T18:00:00.000Z'),
      status: 'scheduled' as const,
    },
  ]);
  const lineups = signal([
    { id: 'lineup-local', matchId: 'match-1', teamId: 'team-local', status: 'pending' as const },
    {
      id: 'lineup-away',
      matchId: 'match-1',
      teamId: 'team-away',
      status: 'submited' as const,
    },
  ]);
  const pairs = signal([
    {
      id: 'pair-1',
      lineupId: 'lineup-away',
      player1Id: 'player-1',
      player2Id: 'player-2',
      totalPlayersValue: 90,
      wonGame: null,
      sets: [],
    },
    {
      id: 'pair-2',
      lineupId: 'lineup-away',
      player1Id: 'player-3',
      player2Id: 'player-4',
      totalPlayersValue: 88,
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
    loadForTeam: jest.fn().mockResolvedValue(undefined),
    loadForMatchday: jest.fn().mockResolvedValue(undefined),
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
    | 'loadForTeam'
    | 'loadForMatchday'
    | 'submitDraft'
    | 'lineupForMatch'
    | 'pairsForLineup'
  >;
}

describe('BackofficeLineupsPageComponent', () => {
  it('shows the president lineup status and pair count for the managed team', async () => {
    const lineupsStore = createLineupsStoreMock();

    await render(BackofficeLineupsPageComponent, {
      providers: [
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        {
          provide: BackofficeMatchdaysStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(false),
            errorMessage: signal<string | null>(null),
            matchdays: signal([]),
            currentMatchday: signal(null),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeTeamsStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            teams: signal([
              {
                id: 'team-local',
                name: 'Locales',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
              {
                id: 'team-away',
                name: 'Visitantes',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
            ]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficePlayersStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            players: signal([
              {
                id: 'player-1',
                firstName: 'Adri',
                lastName: 'Uno',
                email: 'adri@example.com',
                teamId: 'team-away',
                isPresident: false,
                preferredPosition: 'right',
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
                teamId: 'team-away',
                isPresident: false,
                preferredPosition: 'left',
                profileImage: null,
                value: 10,
                wonGames: 0,
                lostGames: 0,
                description: '',
              },
            ]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('PRESIDENT'),
            currentPresidentTeamId: signal('team-away'),
          },
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    expect(await screen.findByText('Enviada')).toBeVisible();
    expect(screen.getByText('2 parejas')).toBeVisible();
    expect(screen.queryByText('Pendiente')).toBeNull();
  });

  it('preloads existing pairs when opening the planner', async () => {
    const lineupsStore = createLineupsStoreMock();

    await render(BackofficeLineupsPageComponent, {
      providers: [
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        {
          provide: BackofficeMatchdaysStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(false),
            errorMessage: signal<string | null>(null),
            matchdays: signal([]),
            currentMatchday: signal(null),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeTeamsStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            teams: signal([
              {
                id: 'team-local',
                name: 'Locales',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
              {
                id: 'team-away',
                name: 'Visitantes',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
            ]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficePlayersStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            players: signal([
              {
                id: 'player-1',
                firstName: 'Adri',
                lastName: 'Uno',
                email: 'adri@example.com',
                teamId: 'team-away',
                isPresident: false,
                preferredPosition: 'right',
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
                teamId: 'team-away',
                isPresident: false,
                preferredPosition: 'left',
                profileImage: null,
                value: 10,
                wonGames: 0,
                lostGames: 0,
                description: '',
              },
            ]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('PRESIDENT'),
            currentPresidentTeamId: signal('team-away'),
          },
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    (await screen.findByRole('button', { name: 'Gestionar' })).click();

    expect(await screen.findByText('Formación de parejas')).toBeVisible();
    expect(screen.getByText('Adri Uno')).toBeVisible();
    expect(screen.getByText('Beto Dos')).toBeVisible();
    expect(
      screen.getByText('Esta alineación ya está enviada y se muestra en modo lectura.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Alineación enviada' })).toBeDisabled();
  });

  it('shows an admin-preparation error when the president submits without an initialized lineup', async () => {
    const lineupsStore = createLineupsStoreMock();
    lineupsStore.submitDraft.mockRejectedValue(new Error('lineup_not_initialized'));
    lineupsStore.lineups.set([
      { id: 'lineup-local', matchId: 'match-1', teamId: 'team-local', status: 'pending' },
      { id: 'lineup-away', matchId: 'match-1', teamId: 'team-away', status: 'pending' },
    ]);
    const toastStore = { success: jest.fn(), error: jest.fn() };

    const view = await render(BackofficeLineupsPageComponent, {
      providers: [
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        {
          provide: BackofficeMatchdaysStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(false),
            errorMessage: signal<string | null>(null),
            matchdays: signal([]),
            currentMatchday: signal(null),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeTeamsStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            teams: signal([
              {
                id: 'team-local',
                name: 'Locales',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
              {
                id: 'team-away',
                name: 'Visitantes',
                description: '',
                secondaryDescription: '',
                logo: null,
              },
            ]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficePlayersStore,
          useValue: {
            isLoading: signal(false),
            hasContent: signal(true),
            errorMessage: signal<string | null>(null),
            players: signal([]),
            load: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('PRESIDENT'),
            currentPresidentTeamId: signal('team-away'),
          },
        },
        { provide: ActionToastStore, useValue: toastStore },
      ],
    });

    const component = view.fixture.componentInstance as unknown as LineupSubmissionTestApi;
    component.selectedMatchId.set('match-1');
    component.plannerTeamId.set('team-away');
    component.plannerPairs.set([
      { id: 'pair-1', player1Id: 'player-1', player2Id: 'player-2' },
      { id: 'pair-2', player1Id: 'player-3', player2Id: 'player-4' },
      { id: 'pair-3', player1Id: 'player-5', player2Id: 'player-6' },
    ]);

    await component.submitLineup();

    expect(toastStore.error).toHaveBeenCalledWith(
      'La alineación aún no ha sido preparada por administración.',
      'Alineación no disponible',
    );
  });
});
