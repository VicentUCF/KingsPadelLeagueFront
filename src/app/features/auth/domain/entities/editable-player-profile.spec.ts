import { resolveEditablePlayerProfileDisplayName } from './editable-player-profile';

describe('resolveEditablePlayerProfileDisplayName', () => {
  it('prefers the alias when it is present', () => {
    expect(
      resolveEditablePlayerProfileDisplayName({
        alias: 'El Mago',
        firstName: 'Vicent',
        lastName: 'Ciscar',
      }),
    ).toBe('El Mago');
  });

  it('falls back to the full name when the alias is empty', () => {
    expect(
      resolveEditablePlayerProfileDisplayName({
        alias: '   ',
        firstName: 'Vicent',
        lastName: 'Ciscar',
      }),
    ).toBe('Vicent Ciscar');
  });
});
