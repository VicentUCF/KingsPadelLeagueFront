import type { AuthUser } from '../../domain/entities/auth-user';
import { applyAuthDevOverride } from './auth-dev-override';

const BASE_USER: AuthUser = {
  id: 'user-1',
  email: 'test@example.com',
  displayName: 'Test User',
  role: 'PRESIDENT',
  teamId: 'team-1',
};

describe('auth-dev-override', () => {
  it('keeps the real auth user when the override is disabled', () => {
    expect(
      applyAuthDevOverride(BASE_USER, {
        enabled: false,
        role: 'PLAYER',
        teamId: null,
      }),
    ).toEqual(BASE_USER);
  });

  it('overrides the role and keeps the original team when no team override is provided', () => {
    expect(
      applyAuthDevOverride(BASE_USER, {
        enabled: true,
        role: 'PLAYER',
        teamId: null,
      }),
    ).toEqual({
      ...BASE_USER,
      role: 'PLAYER',
      teamId: 'team-1',
    });
  });
});
