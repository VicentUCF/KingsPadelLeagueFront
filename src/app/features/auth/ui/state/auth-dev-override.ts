import type { AuthRole, AuthUser } from '../../domain/entities/auth-user';

export interface AuthDevOverrideConfig {
  readonly enabled: boolean;
  readonly role: AuthRole | null;
  readonly teamId: string | null;
}

export function applyAuthDevOverride(user: AuthUser, config: AuthDevOverrideConfig): AuthUser {
  if (!config.enabled || config.role === null) {
    return user;
  }

  return {
    ...user,
    role: config.role,
    teamId: config.teamId ?? user.teamId,
  };
}
