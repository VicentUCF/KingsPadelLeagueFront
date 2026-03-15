import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  type ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { EyeIcon, EyeOffIcon, LucideAngularModule, ShieldCheckIcon } from 'lucide-angular';

import { AuthStore } from '../../state/auth.store';

function matchPasswords(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value as string;
  const confirm = control.get('confirmPassword')?.value as string;
  return password === confirm ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './reset-password-page.component.html',
  styleUrl: './reset-password-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly ShieldCheckIcon = ShieldCheckIcon;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly done = signal(false);
  readonly showPassword = signal(false);
  readonly showConfirm = signal(false);

  readonly form = new FormGroup(
    {
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

  get passwordControl() {
    return this.form.controls.password;
  }
  get confirmPasswordControl() {
    return this.form.controls.confirmPassword;
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

    this.error.set(null);
    this.isLoading.set(true);
    try {
      await this.authStore.resetPassword(this.passwordControl.value);
      this.done.set(true);
      setTimeout(() => void this.router.navigate(['/backoffice']), 2500);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al restablecer la contraseña');
    } finally {
      this.isLoading.set(false);
    }
  }
}
