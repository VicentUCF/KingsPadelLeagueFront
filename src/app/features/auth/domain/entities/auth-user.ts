export type AuthRole = 'ADMIN' | 'PRESIDENT' | 'PLAYER' | 'USER';

export const DEFAULT_AUTH_ROLE: AuthRole = 'USER';

export function isAuthRole(value: unknown): value is AuthRole {
  return value === 'ADMIN' || value === 'PRESIDENT' || value === 'PLAYER' || value === 'USER';
}

export function normalizeAuthRole(value: unknown): AuthRole {
  if (typeof value !== 'string') {
    return DEFAULT_AUTH_ROLE;
  }

  const normalizedValue = value.trim().toUpperCase();
  return isAuthRole(normalizedValue) ? normalizedValue : DEFAULT_AUTH_ROLE;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: AuthRole;
  readonly teamId: string | null;
}
