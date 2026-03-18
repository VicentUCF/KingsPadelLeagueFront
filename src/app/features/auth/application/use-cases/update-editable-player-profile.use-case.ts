import { inject, Injectable } from '@angular/core';

import type { EditablePlayerProfile } from '../../domain/entities/editable-player-profile';
import {
  PLAYER_PROFILE_REPOSITORY,
  type UpdateEditablePlayerProfileCommand,
} from '../ports/player-profile.repository';

@Injectable()
export class UpdateEditablePlayerProfileUseCase {
  private readonly playerProfileRepository = inject(PLAYER_PROFILE_REPOSITORY);

  execute(command: UpdateEditablePlayerProfileCommand): Promise<EditablePlayerProfile> {
    return this.playerProfileRepository.update(command);
  }
}
