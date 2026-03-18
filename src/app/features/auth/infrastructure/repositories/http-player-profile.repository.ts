import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { firstValueFrom } from 'rxjs';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import type { PaginatedResponse, PlayerHttpV1 } from '@core/api/kings-padel-api.types';
import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import { environment } from '../../../../../environments/environment';
import {
  type PlayerProfileRepository,
  type UpdateEditablePlayerProfileCommand,
} from '../../application/ports/player-profile.repository';
import type { EditablePlayerProfile } from '../../domain/entities/editable-player-profile';
import {
  mapEditablePlayerProfileFromHttp,
  mapEditablePlayerProfileUpdateToHttp,
} from '../mappers/player-profile-http.mapper';

@Injectable()
export class HttpPlayerProfileRepository implements PlayerProfileRepository {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  private readonly supabase = inject(SUPABASE_CLIENT) as SupabaseClient;

  async loadById(id: string): Promise<EditablePlayerProfile | null> {
    const response = await firstValueFrom(
      this.http.get<PaginatedResponse<PlayerHttpV1>>(`${this.baseUrl}/v1/players`, {
        params: new HttpParams().set('ids', JSON.stringify([id])).set('limit', '1'),
      }),
    );

    const player = response.items[0];
    return player ? mapEditablePlayerProfileFromHttp(player) : null;
  }

  async update(command: UpdateEditablePlayerProfileCommand): Promise<EditablePlayerProfile> {
    const profileImageUrl =
      command.newProfileImageFile !== null
        ? await this.uploadProfileImage(command.id, command.newProfileImageFile)
        : command.profileImageUrl;

    await firstValueFrom(
      this.http.patch<void>(
        `${this.baseUrl}/v1/players/${command.id}`,
        mapEditablePlayerProfileUpdateToHttp(command, profileImageUrl),
      ),
    );

    return {
      id: command.id,
      alias: command.alias.trim(),
      firstName: command.firstName.trim(),
      instagramUrl: command.instagramUrl.trim(),
      lastName: command.lastName.trim(),
      preferredPosition: command.preferredPosition,
      profileImageUrl,
    };
  }

  private async uploadProfileImage(playerId: string, file: File): Promise<string> {
    const bucket = this.supabase.storage.from(environment.supabasePlayerProfileBucket);
    const storagePath = buildProfileImagePath(playerId, file);
    const { error } = await bucket.upload(storagePath, file, {
      cacheControl: '3600',
      contentType: file.type || 'application/octet-stream',
      upsert: true,
    });

    if (error) {
      throw new Error(error.message);
    }

    const { data } = bucket.getPublicUrl(storagePath);
    if (!data.publicUrl) {
      throw new Error('No se pudo obtener la URL pública de la imagen de perfil');
    }

    return data.publicUrl;
  }
}

const PROFILE_IMAGE_EXTENSION_BY_MIME_TYPE = {
  'image/avif': 'avif',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
} as const;

function buildProfileImagePath(playerId: string, file: File): string {
  return `${playerId}/avatar.${resolveProfileImageExtension(file)}`;
}

function resolveProfileImageExtension(file: File): string {
  const mimeTypeExtension =
    PROFILE_IMAGE_EXTENSION_BY_MIME_TYPE[
      file.type as keyof typeof PROFILE_IMAGE_EXTENSION_BY_MIME_TYPE
    ];

  if (mimeTypeExtension) {
    return mimeTypeExtension;
  }

  const extension = file.name.split('.').pop()?.trim().toLowerCase();
  return extension && extension.length > 0 ? extension : 'bin';
}
