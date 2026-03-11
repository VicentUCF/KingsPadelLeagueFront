import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import {
  type AbstractControl,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  type ValidationErrors,
} from '@angular/forms';

import {
  type BackofficeCrudFormMode,
  type BackofficeSeasonFormValue,
} from '../../models/backoffice-crud.model';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

type SeasonFormGroup = FormGroup<{
  name: FormControl<string>;
  year: FormControl<number | null>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  notes: FormControl<string>;
  status: FormControl<'DRAFT' | 'ACTIVE'>;
}>;

interface SeasonFormStep {
  readonly label: string;
}

@Component({
  selector: 'app-season-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'season-form-dialog',
  },
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './season-form-dialog.component.html',
  styleUrl: './season-form-dialog.component.scss',
})
export class SeasonFormDialogComponent {
  readonly isOpen = input(false);
  readonly mode = input<BackofficeCrudFormMode>('create');
  readonly initialValue = input.required<BackofficeSeasonFormValue>();
  readonly submissionError = input<string | null>(null);
  readonly isSubmitting = input(false);

  readonly cancelled = output<void>();
  readonly submitted = output<BackofficeSeasonFormValue>();

  protected readonly currentStep = signal(0);
  protected readonly steps: readonly SeasonFormStep[] = [
    { label: 'Identidad' },
    { label: 'Calendario' },
    { label: 'Estado y notas' },
  ];
  protected readonly form: SeasonFormGroup = new FormGroup(
    {
      name: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      year: new FormControl<number | null>(null, {
        validators: [Validators.required, Validators.min(2000), Validators.max(2100)],
      }),
      startDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endDate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      notes: new FormControl('', {
        nonNullable: true,
      }),
      status: new FormControl<'DRAFT' | 'ACTIVE'>('DRAFT', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    },
    {
      validators: [validateDateRange],
    },
  );

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const initialValue = this.initialValue();

      this.form.reset({
        name: initialValue.name,
        year: initialValue.year,
        startDate: initialValue.startDate,
        endDate: initialValue.endDate,
        notes: initialValue.notes.join('\n'),
        status: initialValue.status,
      });
      this.currentStep.set(0);

      if (this.mode() === 'create') {
        this.form.controls.status.disable();
      } else {
        this.form.controls.status.enable();
      }
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected nextStep(): void {
    if (!this.isCurrentStepValid()) {
      this.markCurrentStepAsTouched();
      return;
    }

    this.currentStep.update((step) => Math.min(step + 1, this.steps.length - 1));
  }

  protected previousStep(): void {
    this.currentStep.update((step) => Math.max(step - 1, 0));
  }

  protected isCurrentStep(stepIndex: number): boolean {
    return this.currentStep() === stepIndex;
  }

  protected isFirstStep(): boolean {
    return this.currentStep() === 0;
  }

  protected isLastStep(): boolean {
    return this.currentStep() === this.steps.length - 1;
  }

  protected hasControlError(controlName: keyof SeasonFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];

    return control.invalid && (control.touched || control.dirty);
  }

  protected hasDateRangeError(): boolean {
    return Boolean(this.form.errors?.['invalidDateRange']) && this.currentStep() === 1;
  }

  protected submit(): void {
    this.markCurrentStepAsTouched();

    if (!this.form.valid) {
      return;
    }

    const rawValue = this.form.getRawValue();

    this.submitted.emit({
      name: rawValue.name.trim(),
      year: rawValue.year ?? this.initialValue().year,
      startDate: rawValue.startDate,
      endDate: rawValue.endDate,
      notes: rawValue.notes
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
      status: rawValue.status,
    });
  }

  private isCurrentStepValid(): boolean {
    switch (this.currentStep()) {
      case 0:
        return this.form.controls.name.valid && this.form.controls.year.valid;
      case 1:
        return (
          this.form.controls.startDate.valid &&
          this.form.controls.endDate.valid &&
          !this.form.errors?.['invalidDateRange']
        );
      case 2:
        return this.form.controls.status.valid;
      default:
        return false;
    }
  }

  private markCurrentStepAsTouched(): void {
    switch (this.currentStep()) {
      case 0:
        this.form.controls.name.markAsTouched();
        this.form.controls.year.markAsTouched();
        break;
      case 1:
        this.form.controls.startDate.markAsTouched();
        this.form.controls.endDate.markAsTouched();
        break;
      case 2:
        this.form.controls.notes.markAsTouched();
        this.form.controls.status.markAsTouched();
        break;
    }
  }
}

function validateDateRange(control: AbstractControl): ValidationErrors | null {
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!startDate || !endDate) {
    return null;
  }

  return Date.parse(endDate) > Date.parse(startDate) ? null : { invalidDateRange: true };
}
