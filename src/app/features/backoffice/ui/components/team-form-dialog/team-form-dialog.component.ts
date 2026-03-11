import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { BaseInputComponent } from '@shared/ui/base-input/base-input.component';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

import {
  type BackofficeCrudFormMode,
  type BackofficeTeamFormValue,
} from '../../models/backoffice-crud.model';

type TeamFormGroup = FormGroup<{
  name: FormControl<string>;
  shortName: FormControl<string>;
  presidentName: FormControl<string>;
  primaryColor: FormControl<string>;
  secondaryColor: FormControl<string>;
}>;

@Component({
  selector: 'app-team-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'team-form-dialog',
  },
  imports: [BaseInputComponent, ModalShellComponent, ReactiveFormsModule],
  templateUrl: './team-form-dialog.component.html',
  styleUrl: './team-form-dialog.component.scss',
})
export class TeamFormDialogComponent {
  readonly isOpen = input(false);
  readonly mode = input<BackofficeCrudFormMode>('create');
  readonly initialValue = input.required<BackofficeTeamFormValue>();
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);

  readonly cancelled = output<void>();
  readonly submitted = output<BackofficeTeamFormValue>();

  protected readonly currentStep = signal(0);
  protected readonly form: TeamFormGroup = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    shortName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^[A-Z]{2,5}$/)],
    }),
    presidentName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    primaryColor: new FormControl('#1B1F3B', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^#(?:[0-9A-F]{3}){1,2}$/)],
    }),
    secondaryColor: new FormControl('#D4AF37', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/^#(?:[0-9A-F]{3}){1,2}$/)],
    }),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const initialValue = this.initialValue();

      this.form.reset({
        name: initialValue.name,
        shortName: initialValue.shortName,
        presidentName: initialValue.presidentName,
        primaryColor: initialValue.primaryColor.toUpperCase(),
        secondaryColor: initialValue.secondaryColor.toUpperCase(),
      });
      this.currentStep.set(0);
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected nextStep(): void {
    if (!this.isIdentityStepValid()) {
      this.form.controls.name.markAsTouched();
      this.form.controls.shortName.markAsTouched();
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

  protected hasControlError(controlName: keyof TeamFormGroup['controls']): boolean {
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
      name: rawValue.name.trim(),
      shortName: rawValue.shortName.trim().toUpperCase(),
      presidentName: rawValue.presidentName.trim(),
      primaryColor: rawValue.primaryColor.trim().toUpperCase(),
      secondaryColor: rawValue.secondaryColor.trim().toUpperCase(),
    });
  }

  private isIdentityStepValid(): boolean {
    return this.form.controls.name.valid && this.form.controls.shortName.valid;
  }
}
