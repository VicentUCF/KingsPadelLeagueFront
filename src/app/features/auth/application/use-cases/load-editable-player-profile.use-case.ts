import { inject, Injectable } from '@angular/core';

import type { EditablePlayerProfile } from '../../domain/entities/editable-player-profile';
import { PLAYER_PROFILE_REPOSITORY } from '../ports/player-profile.repository';

@Injectable()
export class LoadEditablePlayerProfileUseCase {
  private readonly playerProfileRepository = inject(PLAYER_PROFILE_REPOSITORY);

  execute(id: string): Promise<EditablePlayerProfile | null> {
    return this.playerProfileRepository.loadById(id);
  }
}
