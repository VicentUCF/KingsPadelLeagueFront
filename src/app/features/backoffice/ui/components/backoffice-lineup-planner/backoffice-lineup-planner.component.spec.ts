import { render, screen } from '@testing-library/angular';

import type { BackofficeLineupPair } from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import { BackofficeLineupPlannerComponent } from './backoffice-lineup-planner.component';

describe('BackofficeLineupPlannerComponent', () => {
  it('shows player season points and each pair total points', async () => {
    await render(BackofficeLineupPlannerComponent, {
      inputs: {
        matchTitle: 'Kings vs Titanics',
        teamName: 'Kings',
        players: [
          createPlayer('player-1', 'Adri', 'Uno', 'right', 4),
          createPlayer('player-2', 'Beto', 'Dos', 'left', 6),
          createPlayer('player-3', 'Ciro', 'Tres', 'right', 5),
          createPlayer('player-4', 'Dani', 'Cuatro', 'left', 3),
        ],
        lineup: {
          id: 'lineup-1',
          matchId: 'match-1',
          teamId: 'team-1',
          status: 'pending',
        },
        pairs: [
          createPair('pair-1', 'player-1', 'player-2'),
          createPair('pair-2', 'player-3', 'player-4'),
        ],
        isSubmitting: false,
      },
    });

    expect(await screen.findByText('10 PTS')).toBeVisible();
    expect(screen.getByText('8 PTS')).toBeVisible();
    expect(screen.getByText(/Drive · PTS\s+4/i)).toBeVisible();
    expect(screen.getByText(/Reves · PTS\s+6/i)).toBeVisible();
  });

  it('blocks submit and warns when pair two has more season points than pair one', async () => {
    await render(BackofficeLineupPlannerComponent, {
      inputs: {
        matchTitle: 'Kings vs Titanics',
        teamName: 'Kings',
        players: [
          createPlayer('player-1', 'Adri', 'Uno', 'right', 1),
          createPlayer('player-2', 'Beto', 'Dos', 'left', 2),
          createPlayer('player-3', 'Ciro', 'Tres', 'right', 7),
          createPlayer('player-4', 'Dani', 'Cuatro', 'left', 5),
        ],
        lineup: {
          id: 'lineup-1',
          matchId: 'match-1',
          teamId: 'team-1',
          status: 'pending',
        },
        pairs: [
          createPair('pair-1', 'player-1', 'player-2'),
          createPair('pair-2', 'player-3', 'player-4'),
        ],
        isSubmitting: false,
      },
    });

    expect(
      await screen.findByText(
        'La pareja 1 debe tener igual o más puntos de temporada que la pareja 2.',
      ),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: /Enviar alineación/i })).toBeDisabled();
  });
});

function createPlayer(
  id: string,
  firstName: string,
  lastName: string,
  preferredPosition: BackofficePlayer['preferredPosition'],
  totalPoints: number,
): BackofficePlayer {
  return {
    id,
    firstName,
    lastName,
    email: `${id}@example.com`,
    profileImage: null,
    isPresident: false,
    teamId: 'team-1',
    value: 0,
    totalPoints,
    wonGames: 0,
    lostGames: 0,
    preferredPosition,
    description: '',
  };
}

function createPair(id: string, player1Id: string, player2Id: string): BackofficeLineupPair {
  return {
    id,
    lineupId: 'lineup-1',
    player1Id,
    player2Id,
    totalPlayersValue: 0,
    wonGame: null,
    sets: [],
  };
}
