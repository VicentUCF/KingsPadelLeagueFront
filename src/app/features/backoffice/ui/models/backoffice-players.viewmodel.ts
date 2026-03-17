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
  readonly historyLabel: string;
  readonly userLinkageLabel: string;
  readonly detailPath: string;
}

export function toBackofficePlayerCardViewModel(
  player: BackofficePlayer,
  teamName?: string,
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
    historyLabel: `${player.wonGames}V · ${player.lostGames}D · Valor ${player.value}`,
    userLinkageLabel: player.isPresident ? 'Rol: Presidente' : `Correo: ${player.email}`,
    detailPath: `/backoffice/jugadores/${player.id}`,
  };
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
