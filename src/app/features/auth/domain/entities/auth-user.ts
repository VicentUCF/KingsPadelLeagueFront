export type AuthRole = 'ADMIN' | 'PRESIDENT' | 'USER';

export const DEFAULT_AUTH_ROLE: AuthRole = 'PRESIDENT';

export function isAuthRole(value: unknown): value is AuthRole {
  return value === 'ADMIN' || value === 'PRESIDENT' || value === 'USER';
}

export function normalizeAuthRole(value: unknown): AuthRole {
  return isAuthRole(value) ? value : DEFAULT_AUTH_ROLE;
}

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: AuthRole;
  readonly teamId: string | null;
}
