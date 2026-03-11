import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { BaseSelectComponent } from '@shared/ui/base-select/base-select.component';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

import {
  type BackofficeCrudFormMode,
  type BackofficePlayerFormValue,
  type BackofficeTeamOption,
} from '../../models/backoffice-crud.model';

type PlayerFormGroup = FormGroup<{
  fullName: FormControl<string>;
  nickName: FormControl<string>;
  avatarPath: FormControl<string>;
  preferredSideLabel: FormControl<string>;
  currentTeamId: FormControl<string>;
  linkedUserEmail: FormControl<string>;
  status: FormControl<'ACTIVE' | 'INACTIVE'>;
}>;

@Component({
  selector: 'app-player-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-form-dialog',
  },
  imports: [BaseInputComponent, BaseSelectComponent, ModalShellComponent, ReactiveFormsModule],
  templateUrl: './player-form-dialog.component.html',
  styleUrl: './player-form-dialog.component.scss',
})
export class PlayerFormDialogComponent {
  readonly isOpen = input(false);
  readonly mode = input<BackofficeCrudFormMode>('create');
  readonly initialValue = input.required<BackofficePlayerFormValue>();
  readonly teamOptions = input<readonly BackofficeTeamOption[]>([]);
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);

  readonly cancelled = output<void>();
  readonly submitted = output<BackofficePlayerFormValue>();

  protected readonly currentStep = signal(0);
  protected readonly form: PlayerFormGroup = new FormGroup({
    fullName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    nickName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    avatarPath: new FormControl('', {
      nonNullable: true,
    }),
    preferredSideLabel: new FormControl('Revés', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    currentTeamId: new FormControl('', {
      nonNullable: true,
    }),
    linkedUserEmail: new FormControl('', {
      nonNullable: true,
      validators: [Validators.email],
    }),
    status: new FormControl<'ACTIVE' | 'INACTIVE'>('ACTIVE', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const initialValue = this.initialValue();

      this.form.reset({
        fullName: initialValue.fullName,
        nickName: initialValue.nickName,
        avatarPath: initialValue.avatarPath ?? '',
        preferredSideLabel: initialValue.preferredSideLabel,
        currentTeamId: initialValue.currentTeamId ?? '',
        linkedUserEmail: initialValue.linkedUserEmail ?? '',
        status: initialValue.status,
      });
      this.currentStep.set(0);
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected nextStep(): void {
    if (!this.form.controls.fullName.valid || !this.form.controls.nickName.valid) {
      this.form.controls.fullName.markAsTouched();
      this.form.controls.nickName.markAsTouched();
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
      fullName: rawValue.fullName.trim(),
      nickName: rawValue.nickName.trim(),
      avatarPath: normalizeOptionalValue(rawValue.avatarPath),
      preferredSideLabel: rawValue.preferredSideLabel,
      linkedUserEmail: normalizeOptionalValue(rawValue.linkedUserEmail),
      status: rawValue.status,
      currentTeamId: normalizeOptionalValue(rawValue.currentTeamId),
    });
  }
}

function normalizeOptionalValue(value: string): string | null {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : null;
}
