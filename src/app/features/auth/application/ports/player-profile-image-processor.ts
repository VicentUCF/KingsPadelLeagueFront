import { InjectionToken } from '@angular/core';

export interface PlayerProfileImageProcessor {
  process(file: File): Promise<File>;
}

export const PLAYER_PROFILE_IMAGE_PROCESSOR = new InjectionToken<PlayerProfileImageProcessor>(
  'PlayerProfileImageProcessor',
);
