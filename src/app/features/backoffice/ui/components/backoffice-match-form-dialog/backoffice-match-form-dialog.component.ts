import { ChangeDetectionStrategy, Component, effect, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

interface MatchFormValue {
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly scheduledAt: string;
}

type MatchFormGroup = FormGroup<{
  localTeamId: FormControl<string>;
  awayTeamId: FormControl<string>;
  scheduledAt: FormControl<string>;
}>;

@Component({
  selector: 'app-backoffice-match-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-match-form-dialog' },
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './backoffice-match-form-dialog.component.html',
  styleUrl: './backoffice-match-form-dialog.component.scss',
})
export class BackofficeMatchFormDialogComponent {
  readonly isOpen = input(false);
  readonly isSubmitting = input(false);
  readonly submissionError = input<string | null>(null);
  readonly teams = input<readonly BackofficeTeam[]>([]);
  readonly initialValue = input<MatchFormValue>({
    localTeamId: '',
    awayTeamId: '',
    scheduledAt: '',
  });

  readonly cancelled = output<void>();
  readonly submitted = output<MatchFormValue>();

  protected readonly form: MatchFormGroup = new FormGroup({
    localTeamId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    awayTeamId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    scheduledAt: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;
      this.form.reset(this.initialValue());
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected hasControlError(controlName: keyof MatchFormGroup['controls']): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (control.touched || control.dirty);
  }

  protected teamsAreEqual(): boolean {
    const { localTeamId, awayTeamId } = this.form.getRawValue();
    return localTeamId !== '' && localTeamId === awayTeamId;
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.teamsAreEqual()) return;

    const value = this.form.getRawValue();
    this.submitted.emit(value);
  }
}
