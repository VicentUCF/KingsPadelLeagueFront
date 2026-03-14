import type { BackofficePlayer } from '@features/backoffice/domain/entities/backoffice-player';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { StatusBadgeTone } from './status-badge-tone';

export type BackofficeUserRole = 'president' | 'player' | 'unlinked';

export interface BackofficeUserCardViewModel {
  readonly playerId: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly alias: string;
  readonly fullName: string;
  readonly email: string;
  readonly hasEmail: boolean;
  readonly initials: string;
  readonly avatarPath?: string;
  readonly role: BackofficeUserRole;
  readonly roleLabel: string;
  readonly roleTone: StatusBadgeTone;
  readonly teamName: string;
  readonly teamId: string | null;
  readonly value: number;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly preferredPosition: 'left' | 'right' | 'both';
  readonly preferredPositionLabel: string;
}

export function toBackofficeUserCardViewModel(
  player: BackofficePlayer,
  team: BackofficeTeam | null,
): BackofficeUserCardViewModel {
  const fullName = `${player.firstName} ${player.lastName}`;
  const initials = (player.firstName.charAt(0) + player.lastName.charAt(0)).toUpperCase();
  const hasEmail = player.email.trim().length > 0;

  let role: BackofficeUserRole;
  let roleLabel: string;
  let roleTone: StatusBadgeTone;

  if (!hasEmail) {
    role = 'unlinked';
    roleLabel = 'Sin cuenta';
    roleTone = 'neutral';
  } else if (player.isPresident) {
    role = 'president';
    roleLabel = 'Presidente';
    roleTone = 'warning';
  } else {
    role = 'player';
    roleLabel = 'Jugador';
    roleTone = 'success';
  }

  const positionMap: Record<string, string> = {
    left: 'Revés',
    right: 'Drive',
    both: 'Ambas',
  };

  return {
    playerId: player.id,
    firstName: player.firstName,
    lastName: player.lastName,
    alias: player.alias ?? '',
    fullName,
    email: player.email,
    hasEmail,
    initials,
    ...(player.profileImage ? { avatarPath: player.profileImage } : {}),
    role,
    roleLabel,
    roleTone,
    teamName: team?.name ?? 'Sin equipo',
    teamId: team?.id ?? null,
    value: player.value,
    wonGames: player.wonGames,
    lostGames: player.lostGames,
    preferredPosition: player.preferredPosition,
    preferredPositionLabel: positionMap[player.preferredPosition] ?? player.preferredPosition,
  };
}
