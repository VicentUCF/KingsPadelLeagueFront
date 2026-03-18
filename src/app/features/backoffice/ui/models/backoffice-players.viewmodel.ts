import type {
  BackofficePlayer,
  BackofficePlayerPosition,
} from '@features/backoffice/domain/entities/backoffice-player';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficePlayerCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly avatarPath?: string;
  readonly nickLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly derivedTeamLabel: string;
  readonly matchRecordLabel: string;
  readonly wonGames: number;
  readonly lostGames: number;
  readonly userLinkageLabel: string;
  readonly detailPath: string;
}

export interface BackofficePlayerCardPrivacy {
  readonly showLinkedEmail: boolean;
}

export function toBackofficePlayerCardViewModel(
  player: BackofficePlayer,
  teamName?: string,
  privacy: BackofficePlayerCardPrivacy = DEFAULT_BACKOFFICE_PLAYER_CARD_PRIVACY,
): BackofficePlayerCardViewModel {
  const fullName = [player.firstName, player.lastName].filter(Boolean).join(' ');
  const hasTeam = player.teamId !== undefined && player.teamId !== null;
  const avatarPath = resolvePlayerAvatarPath(player.profileImage);

  return {
    id: player.id,
    title: fullName,
    ...(avatarPath ? { avatarPath } : {}),
    nickLabel:
      player.alias !== undefined ? `"${player.alias}"` : toPositionLabel(player.preferredPosition),
    statusLabel: hasTeam ? 'Asignado' : 'Sin equipo',
    statusTone: hasTeam ? 'success' : 'warning',
    derivedTeamLabel: teamName !== undefined ? `Equipo: ${teamName}` : 'Equipo: Sin asignar',
    matchRecordLabel: `${player.wonGames}V · ${player.lostGames}D`,
    wonGames: player.wonGames,
    lostGames: player.lostGames,
    userLinkageLabel: toUserLinkageLabel(player, privacy),
    detailPath: `/backoffice/jugadores/${player.id}`,
  };
}

const DEFAULT_BACKOFFICE_PLAYER_CARD_PRIVACY: BackofficePlayerCardPrivacy = {
  showLinkedEmail: true,
};

function toUserLinkageLabel(
  player: BackofficePlayer,
  privacy: BackofficePlayerCardPrivacy,
): string {
  if (player.isPresident) {
    return 'Rol: Presidente';
  }

  return privacy.showLinkedEmail ? `Correo: ${player.email}` : 'Cuenta vinculada';
}

function toPositionLabel(position: BackofficePlayerPosition): string {
  switch (position) {
    case 'both':
      return 'Ambas posiciones';
    case 'left':
      return 'Revés';
    case 'right':
      return 'Derecha';
  }
}
