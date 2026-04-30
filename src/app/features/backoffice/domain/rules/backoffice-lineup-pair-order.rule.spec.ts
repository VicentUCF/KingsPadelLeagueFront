import {
  calculateBackofficeLineupPairTotalPoints,
  isBackofficeLineupPairPointOrderValid,
} from './backoffice-lineup-pair-order.rule';

describe('backoffice-lineup-pair-order.rule', () => {
  it('rejects the lineup order when pair two has more season points than pair one', () => {
    const result = isBackofficeLineupPairPointOrderValid(
      [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ],
      [
        { id: 'player-1', totalPoints: 3 },
        { id: 'player-2', totalPoints: 2 },
        { id: 'player-3', totalPoints: 7 },
        { id: 'player-4', totalPoints: 5 },
      ],
    );

    expect(result).toBe(false);
  });

  it('accepts the lineup order when pair one has the same season points as pair two', () => {
    const result = isBackofficeLineupPairPointOrderValid(
      [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ],
      [
        { id: 'player-1', totalPoints: 4 },
        { id: 'player-2', totalPoints: 6 },
        { id: 'player-3', totalPoints: 7 },
        { id: 'player-4', totalPoints: 3 },
      ],
    );

    expect(result).toBe(true);
  });

  it('accepts the lineup order when pair one has more season points than pair two', () => {
    const result = isBackofficeLineupPairPointOrderValid(
      [
        { player1Id: 'player-1', player2Id: 'player-2' },
        { player1Id: 'player-3', player2Id: 'player-4' },
      ],
      [
        { id: 'player-1', totalPoints: 7 },
        { id: 'player-2', totalPoints: 5 },
        { id: 'player-3', totalPoints: 3 },
        { id: 'player-4', totalPoints: 2 },
      ],
    );

    expect(result).toBe(true);
  });

  it('counts missing players as zero points', () => {
    const totalPoints = calculateBackofficeLineupPairTotalPoints(
      { player1Id: 'known-player', player2Id: 'missing-player' },
      [{ id: 'known-player', totalPoints: 8 }],
    );

    expect(totalPoints).toBe(8);
  });
});
