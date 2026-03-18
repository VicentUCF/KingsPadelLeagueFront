import { inject, Injectable } from '@angular/core';

import { PLAYER_PROFILE_IMAGE_PROCESSOR } from '../ports/player-profile-image-processor';

@Injectable()
export class ProcessPlayerProfileImageUseCase {
  private readonly playerProfileImageProcessor = inject(PLAYER_PROFILE_IMAGE_PROCESSOR);

  execute(file: File): Promise<File> {
    return this.playerProfileImageProcessor.process(file);
  }
}
