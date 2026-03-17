import { DEFAULT_AUTH_ROLE, normalizeAuthRole } from './auth-user';

describe('auth-user', () => {
  it.each([
    ['ADMIN', 'ADMIN'],
    ['admin', 'ADMIN'],
    ['PRESIDENT', 'PRESIDENT'],
    ['president', 'PRESIDENT'],
    ['USER', 'USER'],
    ['user', 'USER'],
    ['PLAYER', 'PLAYER'],
    ['player', 'PLAYER'],
  ] as const)('normalizes %s into %s', (value, expected) => {
    expect(normalizeAuthRole(value)).toBe(expected);
  });

  it('falls back to the least privileged role for unknown values', () => {
    expect(normalizeAuthRole('unknown-role')).toBe(DEFAULT_AUTH_ROLE);
  });
});
