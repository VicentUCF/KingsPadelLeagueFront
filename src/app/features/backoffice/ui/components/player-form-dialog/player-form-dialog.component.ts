import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';

import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

import {
  type BackofficeCrudFormMode,
  type BackofficePlayerFormValue,
} from '../../models/backoffice-crud.model';

type PlayerFormGroup = FormGroup<{
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  alias: FormControl<string>;
  profileImage: FormControl<string>;
  preferredPosition: FormControl<'both' | 'left' | 'right'>;
  instagramUrl: FormControl<string>;
}>;

@Component({
  selector: 'app-player-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-form-dialog',
  },
  imports: [LucideAngularModule, ModalShellComponent, ReactiveFormsModule],
  templateUrl: './player-form-dialog.component.html',
  styleUrl: './player-form-dialog.component.scss',
})
export class PlayerFormDialogComponent {
  readonly isOpen = input(false);
  readonly mode = input<BackofficeCrudFormMode>('create');
  readonly initialValue = input.required<BackofficePlayerFormValue>();
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);

  readonly cancelled = output<void>();
  readonly submitted = output<BackofficePlayerFormValue>();

  protected readonly chevronDownIcon = ChevronDown;
  protected readonly currentStep = signal(0);
  protected readonly form: PlayerFormGroup = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      nonNullable: true,
    }),
    alias: new FormControl('', {
      nonNullable: true,
    }),
    profileImage: new FormControl('', { nonNullable: true }),
    preferredPosition: new FormControl<'both' | 'left' | 'right'>('both', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    instagramUrl: new FormControl('', { nonNullable: true }),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const initialValue = this.initialValue();

      this.form.reset({
        firstName: initialValue.firstName,
        lastName: initialValue.lastName,
        alias: initialValue.alias ?? '',
        profileImage: initialValue.profileImage ?? '',
        preferredPosition: initialValue.preferredPosition,
        instagramUrl: initialValue.instagramUrl ?? '',
      });
      this.currentStep.set(0);
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected nextStep(): void {
    if (!this.form.controls.firstName.valid) {
      this.form.controls.firstName.markAsTouched();
      return;
    }

    this.currentStep.set(1);
  }

  protected previousStep(): void {
    this.currentStep.set(0);
  }

  protected isCurrentStep(stepIndex: number): boolean {
    return this.currentStep() === stepIndex;
  }

  protected isFirstStep(): boolean {
    return this.currentStep() === 0;
  }

  protected hasControlError(controlName: keyof PlayerFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (!this.form.valid) {
      return;
    }

    const rawValue = this.form.getRawValue();

    this.submitted.emit({
      firstName: rawValue.firstName.trim(),
      lastName: rawValue.lastName.trim(),
      alias: normalizeOptionalValue(rawValue.alias),
      profileImage: normalizeOptionalValue(rawValue.profileImage),
      preferredPosition: rawValue.preferredPosition,
      instagramUrl: normalizeOptionalValue(rawValue.instagramUrl),
      email: this.initialValue().email,
      teamLabel: this.initialValue().teamLabel,
    });
  }
}

function normalizeOptionalValue(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}
