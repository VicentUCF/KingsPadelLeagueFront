import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EyeIcon, EyeOffIcon, LucideAngularModule, LogInIcon } from 'lucide-angular';

import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  readonly EyeIcon = EyeIcon;
  readonly EyeOffIcon = EyeOffIcon;
  readonly LogInIcon = LogInIcon;

  readonly isLoading = this.authStore.isLoading;
  readonly error = this.authStore.error;

  readonly showPassword = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  get emailControl() {
    return this.form.controls.email;
  }
  get passwordControl() {
    return this.form.controls.password;
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
    if (this.passwordControl.hasError('minlength')) return 'Mínimo 6 caracteres';
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v) => !v);
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    try {
      await this.authStore.login(email, password);
      await this.router.navigate(['/']);
    } catch {
      // error is set in authStore.error signal
    }
  }
}
