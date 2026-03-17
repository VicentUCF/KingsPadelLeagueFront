export type BackofficeRole = 'ADMIN' | 'PRESIDENT' | 'PLAYER';

const BACKOFFICE_ROLE_LABELS: Record<BackofficeRole, string> = {
  ADMIN: 'Admin',
  PRESIDENT: 'Presidente',
  PLAYER: 'Jugador',
};

export function toBackofficeRoleLabel(role: BackofficeRole): string {
  return BACKOFFICE_ROLE_LABELS[role];
}
