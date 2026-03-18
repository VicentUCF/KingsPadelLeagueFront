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
        ? await this.uploadProfileImage(command, command.newProfileImageFile)
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

  private async uploadProfileImage(
    command: UpdateEditablePlayerProfileCommand,
    file: File,
  ): Promise<string> {
    const bucket = this.supabase.storage.from(environment.supabasePlayerProfileBucket);
    const storagePath = buildProfileImagePath(command.id, command.firstName, command.lastName);
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

function buildProfileImagePath(playerId: string, firstName: string, lastName: string): string {
  return `${playerId}/${buildPlayerProfileImageFileName(firstName, lastName)}.png`;
}

function buildPlayerProfileImageFileName(firstName: string, lastName: string): string {
  const resolvedName = [firstName, lastName]
    .map((value) => normalizeFileNameSegment(value))
    .filter((value) => value.length > 0)
    .join('-');

  return resolvedName.length > 0 ? resolvedName : 'player';
}

function normalizeFileNameSegment(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
