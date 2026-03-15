import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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

import { AuthStore } from '../../state/auth.store';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const newPassword = control.get('newPassword')?.value as string;
  const confirm = control.get('confirmPassword')?.value as string;
  if (!newPassword) return null;
  return newPassword === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfilePageComponent {
  protected readonly authStore = inject(AuthStore);

  protected readonly UserIcon = UserIcon;
  protected readonly KeyRoundIcon = KeyRoundIcon;
  protected readonly CheckIcon = CheckIcon;
  protected readonly ArrowLeftIcon = ArrowLeftIcon;

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

  get displayNameControl() {
    return this.profileForm.controls.displayName;
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
}
