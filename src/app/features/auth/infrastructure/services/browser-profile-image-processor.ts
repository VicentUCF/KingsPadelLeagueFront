import { Injectable } from '@angular/core';
import imageCompression, { type Options } from 'browser-image-compression';

import type { PlayerProfileImageProcessor } from '../../application/ports/player-profile-image-processor';

const PROFILE_IMAGE_COMPRESSION_OPTIONS: Options = {
  fileType: 'image/webp',
  initialQuality: 1,
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

@Injectable()
export class BrowserProfileImageProcessor implements PlayerProfileImageProcessor {
  async process(file: File): Promise<File> {
    if (!file.type.startsWith('image/')) {
      throw new Error('El archivo no es una imagen');
    }

    try {
      if (file.size < 150_000) {
        return file;
      }
      return await imageCompression(file, PROFILE_IMAGE_COMPRESSION_OPTIONS);
    } catch {
      return file;
    }
  }
}
