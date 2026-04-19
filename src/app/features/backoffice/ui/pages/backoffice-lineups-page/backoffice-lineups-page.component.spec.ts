import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { render, screen, waitFor } from '@testing-library/angular';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeLineupsPageComponent } from './backoffice-lineups-page.component';

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
    | 'loadForMatchdayAndTeam'
    | 'submitDraft'
    | 'lineupForMatch'
    | 'pairsForLineup'
  >;
}

function createMatchdaysStoreMock() {
  const currentMatchday = {
    id: 'matchday-1',
    name: 'Jornada 1',
    scheduledAt: '2026-03-25T18:00:00.000Z',
    seasonId: 'season-1',
    status: 'in_progress' as const,
  };

  return {
    isLoading: signal(false),
    hasContent: signal(true),
    errorMessage: signal<string | null>(null),
    matchdays: signal([currentMatchday]),
    currentMatchday: signal(currentMatchday),
    nextMatchday: signal(null),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficeMatchdaysStore,
    | 'isLoading'
    | 'hasContent'
    | 'errorMessage'
    | 'matchdays'
    | 'currentMatchday'
    | 'nextMatchday'
    | 'load'
  >;
}

function createTeamsStoreMock() {
  return {
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
  } satisfies Pick<
    BackofficeTeamsStore,
    'isLoading' | 'hasContent' | 'errorMessage' | 'teams' | 'load'
  >;
}

function createPlayersStoreMock() {
  return {
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
        teamId: 'team-away',
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
        teamId: 'team-away',
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
        teamId: 'team-away',
        isPresident: false,
        preferredPosition: 'left' as const,
        profileImage: null,
        value: 10,
        wonGames: 0,
        lostGames: 0,
        description: '',
      },
    ]),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficePlayersStore,
    'isLoading' | 'hasContent' | 'errorMessage' | 'players' | 'load'
  >;
}

describe('BackofficeLineupsPageComponent', () => {
  it('redirects admins away from the president lineup shell', async () => {
    const router = { navigate: jest.fn().mockResolvedValue(true) };
    const lineupsStore = createLineupsStoreMock();

    await render(BackofficeLineupsPageComponent, {
      providers: [
        { provide: Router, useValue: router },
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        { provide: BackofficeMatchdaysStore, useValue: createMatchdaysStoreMock() },
        { provide: BackofficeTeamsStore, useValue: createTeamsStoreMock() },
        { provide: BackofficePlayersStore, useValue: createPlayersStoreMock() },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('ADMIN'),
            currentPresidentTeamId: signal(null),
          } satisfies Pick<BackofficeSessionStore, 'currentPresidentTeamId' | 'currentRole'>,
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    await waitFor(() => {
      expect(router.navigate).toHaveBeenCalledWith(['/backoffice/jornadas']);
    });
    expect(lineupsStore.loadForMatchdayAndTeam).not.toHaveBeenCalled();
  });

  it('loads the current president matchday and shows the planner in read-only mode after submit', async () => {
    const lineupsStore = createLineupsStoreMock();

    await render(BackofficeLineupsPageComponent, {
      providers: [
        { provide: Router, useValue: { navigate: jest.fn().mockResolvedValue(true) } },
        { provide: BackofficeLineupsStore, useValue: lineupsStore },
        { provide: BackofficeMatchdaysStore, useValue: createMatchdaysStoreMock() },
        { provide: BackofficeTeamsStore, useValue: createTeamsStoreMock() },
        { provide: BackofficePlayersStore, useValue: createPlayersStoreMock() },
        {
          provide: BackofficeSessionStore,
          useValue: {
            currentRole: signal('PRESIDENT'),
            currentPresidentTeamId: signal('team-away'),
          } satisfies Pick<BackofficeSessionStore, 'currentPresidentTeamId' | 'currentRole'>,
        },
        {
          provide: ActionToastStore,
          useValue: { success: jest.fn(), error: jest.fn() },
        },
      ],
    });

    await waitFor(() => {
      expect(lineupsStore.loadForMatchdayAndTeam).toHaveBeenCalledWith(
        'matchday-1',
        'team-away',
        false,
      );
    });

    expect(await screen.findByText('Enviada')).toBeVisible();
    expect(screen.getByText('2 parejas')).toBeVisible();

    screen.getByRole('button', { name: /Gestionar alineacion/i }).click();

    expect(
      await screen.findByText('Esta alineación ya fue enviada y se muestra en modo lectura.'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Alineación enviada/i })).toBeDisabled();
  });
});
