import { PadelMatch } from './padel-match.entity';

describe('PadelMatch', () => {
  it('marks a match as ready when four players are confirmed', () => {
    const match = new PadelMatch(
      'ready-match',
      'Club Central',
      'Court 1',
      new Date('2030-04-19T18:00:00.000Z'),
      ['Vicent', 'Marta', 'Lara', 'Javi'],
    );

    expect(match.isReady).toBe(true);
    expect(match.missingPlayersCount).toBe(0);
  });

  it('identifies matches scheduled before a reference date', () => {
    const match = new PadelMatch(
      'pending-match',
      'Club Central',
      'Court 2',
      new Date('2030-04-17T18:00:00.000Z'),
      ['Vicent', 'Marta'],
    );

    expect(match.isScheduledAfter(new Date('2030-04-18T00:00:00.000Z'))).toBe(false);
    expect(match.missingPlayersCount).toBe(2);
  });
});
