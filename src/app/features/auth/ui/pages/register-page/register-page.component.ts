import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EyeIcon, EyeOffIcon, LucideAngularModule, UserPlusIcon } from 'lucide-angular';

import { AuthStore } from '../../state/auth.store';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string;
  const confirm = control.get('confirmPassword')?.value as string;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './register-page.component.html',
  styleUrl: './register-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly UserPlusIcon = UserPlusIcon;

  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);
  readonly registered = signal(false);

  readonly form = new FormGroup(
    {
      displayName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.minLength(2)],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email],
      }),
      password: new FormControl('', {
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
    return this.form.controls.displayName;
  }
  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
  }
  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
  }

  get displayNameError(): string | null {
    if (!this.displayNameControl.touched) return null;
    if (this.displayNameControl.hasError('required')) return 'El nombre es obligatorio';
    if (this.displayNameControl.hasError('minlength')) return 'Mínimo 2 caracteres';
    return null;
  }

  get emailError(): string | null {
    if (!this.emailControl.touched) return null;
    if (this.emailControl.hasError('required')) return 'El email es obligatorio';
    if (this.emailControl.hasError('email')) return 'Introduce un email válido';
    return null;
  }

  get passwordError(): string | null {
    if (!this.passwordControl.touched) return null;
    if (this.passwordControl.hasError('required')) return 'La contraseña es obligatoria';
    if (this.passwordControl.hasError('minlength')) return 'Mínimo 8 caracteres';
    return null;
  }

  get confirmPasswordError(): string | null {
    if (!this.confirmPasswordControl.touched) return null;
    if (this.confirmPasswordControl.hasError('required')) return 'Confirma tu contraseña';
    if (this.form.hasError('passwordMismatch')) return 'Las contraseñas no coinciden';
    return null;
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, displayName } = this.form.getRawValue();
    try {
      await this.authStore.register(email, password, displayName);
      this.registered.set(true);
    } catch {
      // error shown via authStore.error
    }
  }
}
