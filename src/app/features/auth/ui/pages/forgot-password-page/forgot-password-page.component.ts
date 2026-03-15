import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ArrowLeftIcon, LucideAngularModule, MailIcon } from 'lucide-angular';

import { AuthStore } from '../../state/auth.store';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './forgot-password-page.component.html',
  styleUrl: './forgot-password-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordPageComponent {
  private readonly authStore = inject(AuthStore);

  readonly MailIcon = MailIcon;
  readonly ArrowLeftIcon = ArrowLeftIcon;

  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly sent = signal(false);

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  get emailControl() {
    return this.form.controls.email;
  }

  get emailError(): string | null {
    if (!this.emailControl.touched) return null;
    if (this.emailControl.hasError('required')) return 'El email es obligatorio';
    if (this.emailControl.hasError('email')) return 'Introduce un email válido';
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
      await this.authStore.requestPasswordReset(this.emailControl.value);
      this.sent.set(true);
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error al enviar el email');
    } finally {
      this.isLoading.set(false);
    }
  }
}
