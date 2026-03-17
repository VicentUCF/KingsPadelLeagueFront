export type AuthRole = 'ADMIN' | 'PRESIDENT' | 'USER';

export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: AuthRole;
  readonly teamId: string | null;
}
