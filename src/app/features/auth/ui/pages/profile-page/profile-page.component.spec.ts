import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { fireEvent, render, screen, waitFor } from '@testing-library/angular';

import type { AuthRole, AuthUser } from '@features/auth/domain/entities/auth-user';
import type { EditablePlayerProfile } from '@features/auth/domain/entities/editable-player-profile';
import { ProcessPlayerProfileImageUseCase } from '@features/auth/application/use-cases/process-player-profile-image.use-case';

import { AuthStore } from '../../state/auth.store';
import { ProfilePageComponent } from './profile-page.component';

const createObjectUrlMock = jest.fn(() => 'blob:profile-preview');
const revokeObjectUrlMock = jest.fn();

Object.defineProperty(globalThis.URL, 'createObjectURL', {
  configurable: true,
  value: createObjectUrlMock,
});

Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
  configurable: true,
  value: revokeObjectUrlMock,
});

describe('ProfilePageComponent', () => {
  beforeEach(() => {
    createObjectUrlMock.mockClear();
    revokeObjectUrlMock.mockClear();
  });

  it('loads the editable fields for player accounts', async () => {
    const authStore = createAuthStoreMock();
    const processPlayerProfileImageUseCase = createProcessPlayerProfileImageUseCaseMock();

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: ProcessPlayerProfileImageUseCase,
          useValue: processPlayerProfileImageUseCase,
        },
      ],
    });

    await waitFor(() => {
      expect(authStore.loadCurrentPlayerProfile).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByDisplayValue('Vicent')).toBeVisible();
    expect(screen.getByDisplayValue('Ciscar')).toBeVisible();
    expect(screen.getByDisplayValue('El Mago')).toBeVisible();
    expect(screen.getByDisplayValue('https://instagram.com/el-mago')).toBeVisible();
    expect(screen.getByRole('combobox', { name: /Posición preferida/i })).toHaveValue('left');
  });

  it('submits the editable player profile including the selected avatar file', async () => {
    const authStore = createAuthStoreMock();
    const processPlayerProfileImageUseCase = createProcessPlayerProfileImageUseCaseMock();
    const avatarFile = new File(['avatar'], 'avatar.png', { type: 'image/png' });
    const processedAvatarFile = new File(['compressed-avatar'], 'avatar.webp', {
      type: 'image/webp',
    });
    processPlayerProfileImageUseCase.execute.mockResolvedValue(processedAvatarFile);

    await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: ProcessPlayerProfileImageUseCase,
          useValue: processPlayerProfileImageUseCase,
        },
      ],
    });

    const avatarInput = (await screen.findByLabelText(/Imagen de perfil/i)) as HTMLInputElement;

    await fireEvent.change(avatarInput, {
      target: { files: [avatarFile] },
    });
    await fireEvent.input(screen.getByLabelText(/^Nombre$/i), {
      target: { value: 'Vicent' },
    });
    await fireEvent.input(screen.getByLabelText(/^Apellidos$/i), {
      target: { value: 'Ciscar' },
    });
    await fireEvent.input(screen.getByLabelText(/^Alias$/i), {
      target: { value: 'El Mago' },
    });
    await fireEvent.input(screen.getByLabelText(/Instagram/i), {
      target: { value: 'https://instagram.com/el-mago' },
    });
    await fireEvent.change(screen.getByRole('combobox', { name: /Posición preferida/i }), {
      target: { value: 'left' },
    });

    await fireEvent.click(screen.getByRole('button', { name: /Guardar cambios/i }));

    await waitFor(() => {
      expect(processPlayerProfileImageUseCase.execute).toHaveBeenCalledWith(avatarFile);
      expect(createObjectUrlMock).toHaveBeenCalledWith(processedAvatarFile);
      expect(authStore.updateCurrentPlayerProfile).toHaveBeenCalledWith({
        alias: 'El Mago',
        firstName: 'Vicent',
        instagramUrl: 'https://instagram.com/el-mago',
        lastName: 'Ciscar',
        newProfileImageFile: processedAvatarFile,
        preferredPosition: 'left',
        profileImageUrl: 'https://cdn.test/current-avatar.webp',
      });
    });

    expect(await screen.findByText(/Cambios guardados correctamente/i)).toBeVisible();
  });

  it('keeps the editable profile visible when a refresh fails after the first load', async () => {
    const authStore = createAuthStoreMock();
    const processPlayerProfileImageUseCase = createProcessPlayerProfileImageUseCaseMock();
    authStore.loadCurrentPlayerProfile.mockReset();
    authStore.loadCurrentPlayerProfile
      .mockResolvedValueOnce(createEditablePlayerProfile())
      .mockRejectedValueOnce(new Error('No se pudo recargar tu perfil'));

    const { fixture } = await render(ProfilePageComponent, {
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: authStore },
        {
          provide: ProcessPlayerProfileImageUseCase,
          useValue: processPlayerProfileImageUseCase,
        },
      ],
    });

    expect(await screen.findByDisplayValue('Vicent')).toBeVisible();

    await fixture.componentInstance['retryLoadEditableProfile']();
    fixture.detectChanges();

    await waitFor(() => {
      expect(screen.getByText(/No se pudo recargar tu perfil/i)).toBeVisible();
    });

    expect(screen.getByDisplayValue('Vicent')).toBeVisible();
    expect(screen.getByDisplayValue('Ciscar')).toBeVisible();
    expect(screen.getByRole('button', { name: /Guardar cambios/i })).toBeVisible();
    expect(authStore.loadCurrentPlayerProfile).toHaveBeenCalledTimes(2);
  });
});

function createAuthStoreMock(
  role: AuthRole = 'PLAYER',
  profile: EditablePlayerProfile = createEditablePlayerProfile(),
) {
  return {
    user: signal<AuthUser | null>({
      id: 'player-1',
      email: 'vicent@test.com',
      displayName: 'Vicent Ciscar',
      role,
      teamId: null,
    }),
    currentRole: signal<AuthRole | null>(role),
    loadCurrentPlayerProfile: jest.fn().mockResolvedValue(profile),
    updateCurrentPlayerProfile: jest.fn().mockResolvedValue(profile),
    updateProfile: jest.fn().mockResolvedValue(undefined),
    changePassword: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    AuthStore,
    | 'changePassword'
    | 'currentRole'
    | 'loadCurrentPlayerProfile'
    | 'updateCurrentPlayerProfile'
    | 'updateProfile'
    | 'user'
  >;
}

function createProcessPlayerProfileImageUseCaseMock() {
  return {
    execute: jest.fn(async (file: File) => file),
  } satisfies Pick<ProcessPlayerProfileImageUseCase, 'execute'>;
}

function createEditablePlayerProfile(): EditablePlayerProfile {
  return {
    id: 'player-1',
    alias: 'El Mago',
    firstName: 'Vicent',
    instagramUrl: 'https://instagram.com/el-mago',
    lastName: 'Ciscar',
    preferredPosition: 'left',
    profileImageUrl: 'https://cdn.test/current-avatar.webp',
  };
}
