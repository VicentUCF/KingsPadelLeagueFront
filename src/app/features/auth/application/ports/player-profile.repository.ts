import { InjectionToken } from '@angular/core';

import type {
  EditablePlayerPreferredPosition,
  EditablePlayerProfile,
} from '../../domain/entities/editable-player-profile';

export interface UpdateEditablePlayerProfileCommand {
  readonly id: string;
  readonly alias: string;
  readonly firstName: string;
  readonly instagramUrl: string;
  readonly lastName: string;
  readonly preferredPosition: EditablePlayerPreferredPosition;
  readonly profileImageUrl: string | null;
  readonly newProfileImageFile: File | null;
}

export interface PlayerProfileRepository {
  loadById(id: string): Promise<EditablePlayerProfile | null>;
  update(command: UpdateEditablePlayerProfileCommand): Promise<EditablePlayerProfile>;
}

export const PLAYER_PROFILE_REPOSITORY = new InjectionToken<PlayerProfileRepository>(
  'PlayerProfileRepository',
);
