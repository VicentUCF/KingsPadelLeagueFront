import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';

import { API_BASE_URL } from '@core/api/api-base-url.token';
import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import { environment } from '../../../../../environments/environment';

import { HttpPlayerProfileRepository } from './http-player-profile.repository';

describe('HttpPlayerProfileRepository', () => {
  let repository: HttpPlayerProfileRepository;
  let httpTestingController: HttpTestingController;
  let storageFrom: jest.Mock;
  let upload: jest.Mock;
  let getPublicUrl: jest.Mock;

  beforeEach(() => {
    const supabaseClientMock = createSupabaseClientMock();
    storageFrom = supabaseClientMock.storageFrom;
    upload = supabaseClientMock.upload;
    getPublicUrl = supabaseClientMock.getPublicUrl;

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://api.test' },
        { provide: SUPABASE_CLIENT, useValue: supabaseClientMock.client },
        HttpPlayerProfileRepository,
      ],
    });

    repository = TestBed.inject(HttpPlayerProfileRepository);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('loads the editable profile for a single player', async () => {
    const profilePromise = repository.loadById('player-1');

    const request = httpTestingController.expectOne((httpRequest) => {
      return (
        httpRequest.url === 'http://api.test/v1/players' &&
        httpRequest.params.get('limit') === '1' &&
        httpRequest.params.get('ids') === '["player-1"]'
      );
    });

    request.flush({
      items: [
        createPlayerHttp({
          id: 'player-1',
          alias: 'El Mago',
          firstName: 'Vicent',
          instagramUrl: 'https://instagram.com/el-mago',
          lastName: 'Ciscar',
          preferredPosition: 'left',
          profileImage: 'https://placeholder.com/images/player1.png',
        }),
      ],
      meta: createMeta(1),
    });

    await expect(profilePromise).resolves.toEqual({
      id: 'player-1',
      alias: 'El Mago',
      firstName: 'Vicent',
      instagramUrl: 'https://instagram.com/el-mago',
      lastName: 'Ciscar',
      preferredPosition: 'left',
      profileImageUrl: null,
    });
  });

  it('uploads the new avatar before patching the player profile', async () => {
    const avatarFile = new File(['avatar-binary'], 'avatar.webp', {
      type: 'image/webp',
    });

    const updatePromise = repository.update({
      id: 'player-1',
      alias: 'El Mago',
      firstName: 'Vicent',
      instagramUrl: 'https://instagram.com/el-mago',
      lastName: 'Ciscar',
      preferredPosition: 'left',
      profileImageUrl: 'https://cdn.test/current-avatar.webp',
      newProfileImageFile: avatarFile,
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const request = httpTestingController.expectOne(
      (httpRequest) => httpRequest.url === 'http://api.test/v1/players/player-1',
    );

    expect(storageFrom).toHaveBeenCalledWith(environment.supabasePlayerProfileBucket);
    expect(upload).toHaveBeenCalledWith(
      expect.stringMatching(/^player-1\//),
      avatarFile,
      expect.objectContaining({
        cacheControl: '3600',
        contentType: 'image/webp',
        upsert: true,
      }),
    );
    expect(getPublicUrl).toHaveBeenCalled();
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      alias: 'El Mago',
      firstName: 'Vicent',
      instagramUrl: 'https://instagram.com/el-mago',
      lastName: 'Ciscar',
      preferredPosition: 'left',
      profileImage: 'https://cdn.test/storage/player-1/avatar.webp',
    });

    request.flush(null, { status: 204, statusText: 'No Content' });

    await expect(updatePromise).resolves.toEqual({
      id: 'player-1',
      alias: 'El Mago',
      firstName: 'Vicent',
      instagramUrl: 'https://instagram.com/el-mago',
      lastName: 'Ciscar',
      preferredPosition: 'left',
      profileImageUrl: 'https://cdn.test/storage/player-1/avatar.webp',
    });
  });
});

function createSupabaseClientMock() {
  const upload = jest.fn().mockResolvedValue({
    data: { path: 'player-1/avatar.webp' },
    error: null,
  });
  const getPublicUrl = jest.fn().mockReturnValue({
    data: { publicUrl: 'https://cdn.test/storage/player-1/avatar.webp' },
  });
  const storageFrom = jest.fn().mockReturnValue({
    upload,
    getPublicUrl,
  });

  return {
    client: {
      storage: {
        from: storageFrom,
      },
    } as unknown as SupabaseClient,
    getPublicUrl,
    storageFrom,
    upload,
  };
}

function createMeta(itemCount: number) {
  return {
    currentPage: 1,
    itemCount,
    itemsPerPage: itemCount,
    totalItems: itemCount,
    totalPages: 1,
  };
}

function createPlayerHttp(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 'player-id',
    createdAt: '2026-03-17T10:00:00.000Z',
    firstName: 'Jugador',
    lastName: 'Demo',
    email: 'demo@example.com',
    description: 'Perfil oficial',
    profileImage: 'https://cdn.test/player.png',
    isPresident: false,
    value: 0,
    wonGames: 0,
    lostGames: 0,
    preferredPosition: 'right',
    ...overrides,
  };
}
