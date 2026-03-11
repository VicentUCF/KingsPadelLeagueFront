export type BackofficeRole = 'ADMIN' | 'PRESIDENT' | 'USER';

export const BACKOFFICE_ROLES: readonly BackofficeRole[] = ['ADMIN', 'PRESIDENT', 'USER'];

export function isBackofficeRole(value: string): value is BackofficeRole {
  return BACKOFFICE_ROLES.includes(value as BackofficeRole);
}
