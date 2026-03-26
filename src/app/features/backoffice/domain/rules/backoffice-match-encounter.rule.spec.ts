import {
  createBackofficeMatchEncounterKey,
  hasBackofficeMatchEncounterDuplicate,
} from './backoffice-match-encounter.rule';

describe('backoffice-match-encounter.rule', () => {
  it('creates the same encounter key regardless of team order', () => {
    expect(createBackofficeMatchEncounterKey('team-1', 'team-2')).toBe(
      createBackofficeMatchEncounterKey('team-2', 'team-1'),
    );
  });

  it('detects duplicate encounters regardless of team order', () => {
    expect(
      hasBackofficeMatchEncounterDuplicate(
        [{ localTeamId: 'team-1', awayTeamId: 'team-2' }],
        'team-2',
        'team-1',
      ),
    ).toBe(true);
  });

  it('ignores empty team ids', () => {
    expect(
      hasBackofficeMatchEncounterDuplicate(
        [{ localTeamId: 'team-1', awayTeamId: 'team-2' }],
        '',
        'team-2',
      ),
    ).toBe(false);
  });
});
