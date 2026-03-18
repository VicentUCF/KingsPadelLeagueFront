import type { PlayerHttpV1 } from '@core/api/kings-padel-api.types';
import { resolvePlayerAvatarPath } from '@shared/utils/player-avatar';

import type { UpdateEditablePlayerProfileCommand } from '../../application/ports/player-profile.repository';
import type { EditablePlayerProfile } from '../../domain/entities/editable-player-profile';

interface UpdateOnePlayerHttpV1 {
  readonly alias: string;
  readonly firstName: string;
  readonly instagramUrl: string;
  readonly lastName: string;
  readonly preferredPosition: EditablePlayerProfile['preferredPosition'];
  readonly profileImage?: string;
}

export function mapEditablePlayerProfileFromHttp(player: PlayerHttpV1): EditablePlayerProfile {
  return {
    id: player.id,
    alias: player.alias ?? '',
    firstName: player.firstName,
    instagramUrl: player.instagramUrl ?? '',
    lastName: player.lastName,
    preferredPosition: player.preferredPosition,
    profileImageUrl: resolvePlayerAvatarPath(player.profileImage),
  };
}

export function mapEditablePlayerProfileUpdateToHttp(
  command: UpdateEditablePlayerProfileCommand,
  profileImageUrl: string | null,
): UpdateOnePlayerHttpV1 {
  return {
    alias: command.alias.trim(),
    firstName: command.firstName.trim(),
    instagramUrl: command.instagramUrl.trim(),
    lastName: command.lastName.trim(),
    preferredPosition: command.preferredPosition,
    ...(profileImageUrl ? { profileImage: profileImageUrl } : {}),
  };
}
