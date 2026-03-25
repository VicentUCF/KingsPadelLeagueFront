import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

interface MatchdayFormValue {
  readonly name: string;
  readonly scheduledAt: string;
  readonly seasonId: string;
}

type MatchdayFormGroup = FormGroup<{
  name: FormControl<string>;
  scheduledAt: FormControl<string>;
  seasonId: FormControl<string>;
}>;

@Component({
  selector: 'app-backoffice-matchday-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-matchday-form-dialog' },
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './backoffice-matchday-form-dialog.component.html',
  styleUrl: './backoffice-matchday-form-dialog.component.scss',
})
export class BackofficeMatchdayFormDialogComponent {
  readonly isOpen = input(false);
  readonly isSubmitting = input(false);
  readonly submissionError = input<string | null>(null);
  readonly initialValue = input<MatchdayFormValue>({
    name: '',
    scheduledAt: '',
    seasonId: '',
  });

  readonly cancelled = output<void>();
  readonly submitted = output<MatchdayFormValue>();

  protected readonly form: MatchdayFormGroup = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    scheduledAt: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    seasonId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      const initialValue = this.initialValue();
      this.form.reset(initialValue);
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected hasControlError(controlName: keyof MatchdayFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    this.submitted.emit({
      name: value.name.trim(),
      scheduledAt: value.scheduledAt,
      seasonId: value.seasonId,
    });
  }
}
