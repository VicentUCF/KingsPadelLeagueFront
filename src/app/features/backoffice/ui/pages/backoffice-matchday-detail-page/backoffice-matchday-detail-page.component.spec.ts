import { signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { render, screen } from '@testing-library/angular';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficeLineupsStore } from '../../state/backoffice-lineups.store';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import { BackofficeMatchdayDetailPageComponent } from './backoffice-matchday-detail-page.component';

describe('BackofficeMatchdayDetailPageComponent', () => {
  it('shows admin operational controls in the matchday detail', async () => {
    await renderComponentWithRole('ADMIN');

    expect(screen.getAllByRole('button', { name: /Iniciar jornada/i })).toHaveLength(2);
    expect(screen.getByRole('button', { name: /Finalizar jornada/i })).toBeVisible();
    expect(
      screen.getByRole('button', { name: /Generar enfrentamientos de parejas/i }),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Nuevo partido/i })).toBeVisible();
    expect(screen.getByRole('button', { name: /Editar MVP/i })).toBeVisible();
    expect(screen.getByText('Resumen operativo')).toBeVisible();
    expect(screen.getByText('2/2 enfrentamientos')).toBeVisible();
    expect(screen.getByRole('button', { name: /Finalizar jornada/i })).toBeDisabled();
    expect(screen.getByText('Partido 1')).toBeVisible();
    expect(screen.getByText('Partido 2')).toBeVisible();
    expect(screen.getByText('3 puntos')).toBeVisible();
    expect(screen.getByText('2 puntos')).toBeVisible();
    expect(screen.queryByText('Magic City')).not.toBeInTheDocument();
    expect(screen.queryByText('Barbaridad')).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Registrar resultado/i })).toHaveLength(2);
  });

  it('keeps the president lineup flow and hides admin controls', async () => {
    await renderComponentWithRole('PRESIDENT');

    expect(screen.getByRole('button', { name: /Gestionar alineación/i })).toBeVisible();
    expect(screen.queryByRole('button', { name: /Iniciar jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Nuevo partido/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar MVP/i })).not.toBeInTheDocument();
  });
});

async function renderComponentWithRole(role: 'ADMIN' | 'PRESIDENT') {
  const match = {
    id: 'match-1',
    matchdayId: 'matchday-1',
    localTeamId: 'team-1',
    awayTeamId: 'team-2',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-25T18:00:00.000Z'),
    status: 'scheduled' as const,
    mvpId: null,
  };
  const otherMatch = {
    id: 'match-2',
    matchdayId: 'matchday-2',
    localTeamId: 'team-3',
    awayTeamId: 'team-4',
    localTeamScorePoints: 0,
    awayTeamScorePoints: 0,
    scheduledAt: new Date('2026-03-26T18:00:00.000Z'),
    status: 'scheduled' as const,
    mvpId: null,
  };
  const localLineup = {
    id: 'lineup-1',
    matchId: 'match-1',
    teamId: 'team-1',
    status: 'submited' as const,
  };
  const awayLineup = {
    id: 'lineup-2',
    matchId: 'match-1',
    teamId: 'team-2',
    status: 'submited' as const,
  };
  const localPair = {
    id: 'pair-1',
    lineupId: 'lineup-1',
    player1Id: 'player-1',
    player2Id: 'player-2',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [],
  };
  const localPairTwo = {
    id: 'pair-3',
    lineupId: 'lineup-1',
    player1Id: 'player-5',
    player2Id: 'player-6',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [],
  };
  const awayPair = {
    id: 'pair-2',
    lineupId: 'lineup-2',
    player1Id: 'player-3',
    player2Id: 'player-4',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [],
  };
  const awayPairTwo = {
    id: 'pair-4',
    lineupId: 'lineup-2',
    player1Id: 'player-7',
    player2Id: 'player-8',
    totalPlayersValue: 100,
    wonGame: null,
    sets: [],
  };

  const lineupsStoreMock = {
    matches: signal([match, otherMatch]),
    lineups: signal([localLineup, awayLineup]),
    pairs: signal([localPair, awayPair, localPairTwo, awayPairTwo]),
    isLoading: signal(false),
    errorMessage: signal<string | null>(null),
    hasContent: signal(true),
    loadForMatchday: jest.fn().mockResolvedValue(undefined),
    lineupForMatch: jest.fn((matchId: string, teamId: string) =>
      [localLineup, awayLineup].find(
        (lineup) => lineup.matchId === matchId && lineup.teamId === teamId,
      ),
    ),
    pairsForLineup: jest.fn((lineupId: string) =>
      [localPair, awayPair, localPairTwo, awayPairTwo].filter((pair) => pair.lineupId === lineupId),
    ),
  } satisfies Pick<
    BackofficeLineupsStore,
    | 'errorMessage'
    | 'hasContent'
    | 'isLoading'
    | 'lineupForMatch'
    | 'lineups'
    | 'loadForMatchday'
    | 'matches'
    | 'pairs'
    | 'pairsForLineup'
  >;

  await render(BackofficeMatchdayDetailPageComponent, {
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
        provide: BackofficeMatchdaysStore,
        useValue: {
          matchdays: signal([
            {
              id: 'matchday-1',
              name: 'Jornada 1',
              scheduledAt: '2026-03-25T18:00:00.000Z',
              seasonId: 'season-1',
              status: 'scheduled',
            },
          ]),
          isLoading: signal(false),
          errorMessage: signal<string | null>(null),
          hasContent: signal(true),
          load: jest.fn().mockResolvedValue(undefined),
        } satisfies Pick<
          BackofficeMatchdaysStore,
          'errorMessage' | 'hasContent' | 'isLoading' | 'load' | 'matchdays'
        >,
      },
      { provide: BackofficeLineupsStore, useValue: lineupsStoreMock },
      {
        provide: BackofficeTeamsStore,
        useValue: {
          teams: signal([
            {
              id: 'team-1',
              name: 'Kings Of Favar',
              description: 'Local',
              secondaryDescription: 'Local',
              logo: null,
            },
            {
              id: 'team-2',
              name: 'Titanics',
              description: 'Away',
              secondaryDescription: 'Away',
              logo: null,
            },
            {
              id: 'team-3',
              name: 'Magic City',
              description: 'Other',
              secondaryDescription: 'Other',
              logo: null,
            },
            {
              id: 'team-4',
              name: 'Barbaridad',
              description: 'Other',
              secondaryDescription: 'Other',
              logo: null,
            },
          ]),
          isLoading: signal(false),
          errorMessage: signal<string | null>(null),
          hasContent: signal(true),
          load: jest.fn().mockResolvedValue(undefined),
        } satisfies Pick<
          BackofficeTeamsStore,
          'errorMessage' | 'hasContent' | 'isLoading' | 'load' | 'teams'
        >,
      },
      {
        provide: BackofficePlayersStore,
        useValue: {
          players: signal([
            createPlayer('player-1', 'Adri', 'Alvarez', 'team-1'),
            createPlayer('player-2', 'Luis', 'Lopez', 'team-1'),
            createPlayer('player-3', 'Marta', 'Martin', 'team-2'),
            createPlayer('player-4', 'Nora', 'Navarro', 'team-2'),
            createPlayer('player-5', 'Pau', 'Perez', 'team-1'),
            createPlayer('player-6', 'Sara', 'Soler', 'team-1'),
            createPlayer('player-7', 'Eva', 'Escriba', 'team-2'),
            createPlayer('player-8', 'Joan', 'Jorda', 'team-2'),
          ]),
          isLoading: signal(false),
          errorMessage: signal<string | null>(null),
          hasContent: signal(true),
          load: jest.fn().mockResolvedValue(undefined),
        } satisfies Pick<
          BackofficePlayersStore,
          'errorMessage' | 'hasContent' | 'isLoading' | 'load' | 'players'
        >,
      },
      {
        provide: BackofficeSessionStore,
        useValue: {
          currentRole: signal(role),
          currentPresidentTeamId: signal('team-1'),
        } satisfies Pick<BackofficeSessionStore, 'currentPresidentTeamId' | 'currentRole'>,
      },
      {
        provide: BackofficeAdminMatchdayOperationsStore,
        useValue: {
          pairMatches: signal([
            {
              id: 'pair-match-1',
              localLineUpPairId: 'pair-1',
              awayLineUpPairId: 'pair-2',
              status: 'scheduled',
              setsResult: [],
            },
            {
              id: 'pair-match-2',
              localLineUpPairId: 'pair-3',
              awayLineUpPairId: 'pair-4',
              status: 'scheduled',
              setsResult: [],
            },
          ]),
          pairMatchesErrorMessage: signal<string | null>(null),
          isLoadingPairMatches: signal(false),
          isCreatingMatchday: signal(false),
          isStartingMatchday: signal(false),
          isFinishingMatchday: signal(false),
          isCreatingPairMatches: signal(false),
          isCreatingMatch: signal(false),
          matchActionIds: signal({}),
          pairMatchActionIds: signal({}),
          loadPairMatches: jest.fn().mockResolvedValue(undefined),
          startMatchday: jest.fn().mockResolvedValue(undefined),
          finishMatchday: jest.fn().mockResolvedValue(undefined),
          createPairMatches: jest.fn().mockResolvedValue(undefined),
          createMatch: jest.fn().mockResolvedValue(undefined),
          startMatch: jest.fn().mockResolvedValue(undefined),
          finishMatch: jest.fn().mockResolvedValue(undefined),
          updateMatchMvp: jest.fn().mockResolvedValue(undefined),
          finishPairMatch: jest.fn().mockResolvedValue(undefined),
        } satisfies Pick<
          BackofficeAdminMatchdayOperationsStore,
          | 'createMatch'
          | 'createPairMatches'
          | 'finishMatch'
          | 'finishMatchday'
          | 'finishPairMatch'
          | 'isCreatingMatch'
          | 'isCreatingMatchday'
          | 'isCreatingPairMatches'
          | 'isFinishingMatchday'
          | 'isLoadingPairMatches'
          | 'isStartingMatchday'
          | 'loadPairMatches'
          | 'matchActionIds'
          | 'pairMatchActionIds'
          | 'pairMatches'
          | 'pairMatchesErrorMessage'
          | 'startMatch'
          | 'startMatchday'
          | 'updateMatchMvp'
        >,
      },
      {
        provide: ActionToastStore,
        useValue: { success: jest.fn(), error: jest.fn() },
      },
    ],
  });
}

function createPlayer(id: string, firstName: string, lastName: string, teamId: string) {
  return {
    id,
    firstName,
    lastName,
    email: `${id}@example.com`,
    profileImage: null,
    isPresident: false,
    teamId,
    value: 100,
    wonGames: 2,
    lostGames: 1,
    preferredPosition: 'both' as const,
    description: 'Jugador de prueba',
  };
}
