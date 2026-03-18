import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  type ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import type { OnDestroy } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArrowLeftIcon,
  CheckIcon,
  KeyRoundIcon,
  LucideAngularModule,
  UserIcon,
} from 'lucide-angular';

import {
  resolveEditablePlayerProfileDisplayName,
  type EditablePlayerPreferredPosition,
  type EditablePlayerProfile,
} from '../../../domain/entities/editable-player-profile';
import { AuthStore } from '../../state/auth.store';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value as string;
  const confirm = control.get('confirmPassword')?.value as string;
  if (!newPassword) return null;
  return newPassword === confirm ? null : { passwordMismatch: true };
}

function optionalUrlValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { invalidUrl: true };
  } catch {
    return { invalidUrl: true };
  }
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent implements OnDestroy {
  protected readonly authStore = inject(AuthStore);
  private readonly profileImageInput = viewChild<ElementRef<HTMLInputElement>>('profileImageInput');

  protected readonly UserIcon = UserIcon;
  protected readonly KeyRoundIcon = KeyRoundIcon;
  protected readonly CheckIcon = CheckIcon;
  protected readonly ArrowLeftIcon = ArrowLeftIcon;

  protected readonly canEditPlayerProfile = computed(() => {
    const role = this.authStore.currentRole();
    return role === 'PLAYER' || role === 'PRESIDENT';
  });

  protected readonly editableProfileLoading = signal(false);
  protected readonly editableProfileLoadError = signal<string | null>(null);
  protected readonly playerProfile = signal<EditablePlayerProfile | null>(null);
  protected readonly profileImagePreviewUrl = signal<string | null>(null);
  protected readonly selectedProfileImageFile = signal<File | null>(null);

  protected readonly profileLoading = signal(false);
  protected readonly profileError = signal<string | null>(null);
  protected readonly profileSaved = signal(false);

  protected readonly passwordLoading = signal(false);
  protected readonly passwordError = signal<string | null>(null);
  protected readonly passwordSaved = signal(false);

  protected readonly profileForm = new FormGroup({
    displayName: new FormControl(this.authStore.user()?.displayName ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
  });

  protected readonly playerProfileForm = new FormGroup({
    alias: new FormControl('', {
      nonNullable: true,
    }),
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    instagramUrl: new FormControl('', {
      nonNullable: true,
      validators: [optionalUrlValidator],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    preferredPosition: new FormControl<EditablePlayerPreferredPosition>('both', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  protected readonly passwordForm = new FormGroup(
    {
      newPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(8)],
      }),
      confirmPassword: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    { validators: matchPasswords },
  );

  protected readonly profileDisplayName = computed(() => {
    const playerProfile = this.playerProfile();
    if (playerProfile) {
      return resolveEditablePlayerProfileDisplayName(playerProfile);
    }

    return this.authStore.user()?.displayName ?? '';
  });

  protected readonly profileAvatarUrl = computed(
    () => this.profileImagePreviewUrl() ?? this.playerProfile()?.profileImageUrl ?? null,
  );

  protected readonly profileAvatarInitial = computed(() => {
    const displayName = this.profileDisplayName().trim();
    return displayName.charAt(0).toUpperCase() || '?';
  });

  protected readonly selectedProfileImageFileName = computed(
    () => this.selectedProfileImageFile()?.name ?? null,
  );

  private loadedEditableProfileUserId: string | null = null;
  private localProfileImagePreviewUrl: string | null = null;

  constructor() {
    effect(() => {
      const currentUser = this.authStore.user();
      const currentDisplayName = currentUser?.displayName ?? '';
      if (!this.profileForm.dirty && this.displayNameControl.value !== currentDisplayName) {
        this.displayNameControl.setValue(currentDisplayName, { emitEvent: false });
      }

      if (!this.canEditPlayerProfile()) {
        return;
      }

      const userId = currentUser?.id ?? null;
      if (!userId || this.loadedEditableProfileUserId === userId) {
        return;
      }

      this.loadedEditableProfileUserId = userId;
      void this.loadEditablePlayerProfile();
    });
  }

  get displayNameControl() {
    return this.profileForm.controls.displayName;
  }
  get aliasControl() {
    return this.playerProfileForm.controls.alias;
  }
  get firstNameControl() {
    return this.playerProfileForm.controls.firstName;
  }
  get instagramUrlControl() {
    return this.playerProfileForm.controls.instagramUrl;
  }
  get lastNameControl() {
    return this.playerProfileForm.controls.lastName;
  }
  get preferredPositionControl() {
    return this.playerProfileForm.controls.preferredPosition;
  }
  get newPasswordControl() {
    return this.passwordForm.controls.newPassword;
  }
  get confirmPasswordControl() {
    return this.passwordForm.controls.confirmPassword;
  }

  get displayNameError(): string | null {
    if (!this.displayNameControl.touched) return null;
    if (this.displayNameControl.hasError('required')) return 'El nombre es obligatorio';
    if (this.displayNameControl.hasError('minlength')) return 'Mínimo 2 caracteres';
    return null;
  }

  get firstNameError(): string | null {
    if (!this.firstNameControl.touched) return null;
    if (this.firstNameControl.hasError('required')) return 'El nombre es obligatorio';
    if (this.firstNameControl.hasError('minlength')) return 'Mínimo 2 caracteres';
    return null;
  }

  get lastNameError(): string | null {
    if (!this.lastNameControl.touched) return null;
    if (this.lastNameControl.hasError('required')) return 'Los apellidos son obligatorios';
    if (this.lastNameControl.hasError('minlength')) return 'Mínimo 2 caracteres';
    return null;
  }

  get instagramUrlError(): string | null {
    if (!this.instagramUrlControl.touched) return null;
    if (this.instagramUrlControl.hasError('invalidUrl')) return 'Introduce una URL válida';
    return null;
  }

  get newPasswordError(): string | null {
    if (!this.newPasswordControl.touched) return null;
    if (this.newPasswordControl.hasError('required')) return 'Introduce una contraseña';
    if (this.newPasswordControl.hasError('minlength')) return 'Mínimo 8 caracteres';
    return null;
  }

  get confirmPasswordError(): string | null {
    if (!this.confirmPasswordControl.touched) return null;
    if (this.confirmPasswordControl.hasError('required')) return 'Confirma la contraseña';
    if (this.passwordForm.hasError('passwordMismatch')) return 'Las contraseñas no coinciden';
    return null;
  }

  ngOnDestroy(): void {
    this.clearProfileImageSelection();
  }

  protected async retryLoadEditableProfile(): Promise<void> {
    this.loadedEditableProfileUserId = null;
    await this.loadEditablePlayerProfile();
  }

  protected onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0] ?? null;
    if (!input || !file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      this.profileError.set('Selecciona un archivo de imagen válido');
      input.value = '';
      return;
    }

    this.profileError.set(null);
    this.selectedProfileImageFile.set(file);
    this.setLocalProfileImagePreview(file);
  }

  async onSaveProfile(): Promise<void> {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.profileError.set(null);
    this.profileSaved.set(false);
    this.profileLoading.set(true);
    try {
      await this.authStore.updateProfile(this.displayNameControl.value);
      this.profileSaved.set(true);
      setTimeout(() => this.profileSaved.set(false), 3000);
    } catch (err) {
      this.profileError.set(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      this.profileLoading.set(false);
    }
  }

  async onSavePlayerProfile(): Promise<void> {
    if (this.playerProfileForm.invalid) {
      this.playerProfileForm.markAllAsTouched();
      return;
    }

    const currentProfile = this.playerProfile();
    if (!currentProfile) {
      this.profileError.set('No se ha podido cargar tu perfil de jugador');
      return;
    }

    this.profileError.set(null);
    this.profileSaved.set(false);
    this.profileLoading.set(true);
    try {
      const updatedProfile = await this.authStore.updateCurrentPlayerProfile({
        alias: this.aliasControl.value,
        firstName: this.firstNameControl.value,
        instagramUrl: this.instagramUrlControl.value,
        lastName: this.lastNameControl.value,
        newProfileImageFile: this.selectedProfileImageFile(),
        preferredPosition: this.preferredPositionControl.value,
        profileImageUrl: currentProfile.profileImageUrl,
      });

      this.playerProfile.set(updatedProfile);
      this.hydratePlayerProfileForm(updatedProfile);
      this.clearProfileImageSelection();
      this.profileSaved.set(true);
      setTimeout(() => this.profileSaved.set(false), 3000);
    } catch (err) {
      this.profileError.set(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      this.profileLoading.set(false);
    }
  }

  async onChangePassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordError.set(null);
    this.passwordSaved.set(false);
    this.passwordLoading.set(true);
    try {
      await this.authStore.changePassword(this.newPasswordControl.value);
      this.passwordSaved.set(true);
      this.passwordForm.reset();
      setTimeout(() => this.passwordSaved.set(false), 3000);
    } catch (err) {
      this.passwordError.set(err instanceof Error ? err.message : 'Error al cambiar la contraseña');
    } finally {
      this.passwordLoading.set(false);
    }
  }

  private async loadEditablePlayerProfile(): Promise<void> {
    this.editableProfileLoadError.set(null);
    this.editableProfileLoading.set(true);

    try {
      const playerProfile = await this.authStore.loadCurrentPlayerProfile();
      if (!playerProfile) {
        this.playerProfile.set(null);
        this.editableProfileLoadError.set('No se encontró el perfil del jugador');
        return;
      }

      this.playerProfile.set(playerProfile);
      this.hydratePlayerProfileForm(playerProfile);
    } catch (err) {
      this.editableProfileLoadError.set(
        err instanceof Error ? err.message : 'No se pudo cargar tu perfil',
      );
    } finally {
      this.editableProfileLoading.set(false);
    }
  }

  private hydratePlayerProfileForm(playerProfile: EditablePlayerProfile): void {
    this.playerProfileForm.setValue({
      alias: playerProfile.alias,
      firstName: playerProfile.firstName,
      instagramUrl: playerProfile.instagramUrl,
      lastName: playerProfile.lastName,
      preferredPosition: playerProfile.preferredPosition,
    });
    this.playerProfileForm.markAsPristine();
    this.playerProfileForm.markAsUntouched();
  }

  private setLocalProfileImagePreview(file: File): void {
    this.revokeLocalProfileImagePreview();
    this.localProfileImagePreviewUrl = URL.createObjectURL(file);
    this.profileImagePreviewUrl.set(this.localProfileImagePreviewUrl);
  }

  private clearProfileImageSelection(): void {
    this.selectedProfileImageFile.set(null);
    this.profileImagePreviewUrl.set(null);
    this.revokeLocalProfileImagePreview();
  }

  private revokeLocalProfileImagePreview(): void {
    if (!this.localProfileImagePreviewUrl) {
      return;
    }

    URL.revokeObjectURL(this.localProfileImagePreviewUrl);
    this.localProfileImagePreviewUrl = null;
  }
}
