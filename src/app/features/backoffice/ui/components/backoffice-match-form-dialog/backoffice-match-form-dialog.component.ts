import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { hasBackofficeMatchEncounterDuplicate } from '@features/backoffice/domain/rules/backoffice-match-encounter.rule';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

interface MatchFormValue {
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly scheduledAt: string;
}

interface MatchFormExistingMatch {
  readonly localTeamId: string;
  readonly awayTeamId: string;
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
  private readonly destroyRef = inject(DestroyRef);

  readonly isOpen = input(false);
  readonly isSubmitting = input(false);
  readonly submissionError = input<string | null>(null);
  readonly teams = input<readonly BackofficeTeam[]>([]);
  readonly existingMatches = input<readonly MatchFormExistingMatch[]>([]);
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
    const localTeamSubscription = this.form.controls.localTeamId.valueChanges.subscribe(() =>
      this.syncOpponentSelection('localTeamId'),
    );
    const awayTeamSubscription = this.form.controls.awayTeamId.valueChanges.subscribe(() =>
      this.syncOpponentSelection('awayTeamId'),
    );

    this.destroyRef.onDestroy(() => {
      localTeamSubscription.unsubscribe();
      awayTeamSubscription.unsubscribe();
    });

    effect(() => {
      if (!this.isOpen()) return;
      this.form.reset(this.initialValue());
      this.syncOpponentSelection('localTeamId');
      this.syncOpponentSelection('awayTeamId');
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

  protected duplicateEncounterExists(): boolean {
    const { localTeamId, awayTeamId } = this.form.getRawValue();

    return hasBackofficeMatchEncounterDuplicate(this.existingMatches(), localTeamId, awayTeamId);
  }

  protected localTeamOptions(): readonly BackofficeTeam[] {
    const awayTeamId = this.form.controls.awayTeamId.value;

    return this.teams().filter((team) => this.canSelectLocalTeam(team.id, awayTeamId));
  }

  protected awayTeamOptions(): readonly BackofficeTeam[] {
    const localTeamId = this.form.controls.localTeamId.value;

    return this.teams().filter((team) => this.canSelectAwayTeam(team.id, localTeamId));
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.teamsAreEqual() || this.duplicateEncounterExists()) return;

    const value = this.form.getRawValue();
    this.submitted.emit(value);
  }

  private canSelectLocalTeam(teamId: string, awayTeamId: string): boolean {
    if (!awayTeamId) {
      return true;
    }

    return teamId !== awayTeamId && !this.hasDuplicateEncounter(teamId, awayTeamId);
  }

  private canSelectAwayTeam(teamId: string, localTeamId: string): boolean {
    if (!localTeamId) {
      return true;
    }

    return teamId !== localTeamId && !this.hasDuplicateEncounter(localTeamId, teamId);
  }

  private hasDuplicateEncounter(localTeamId: string, awayTeamId: string): boolean {
    return hasBackofficeMatchEncounterDuplicate(this.existingMatches(), localTeamId, awayTeamId);
  }

  private syncOpponentSelection(changedControlName: 'localTeamId' | 'awayTeamId'): void {
    const oppositeControlName = changedControlName === 'localTeamId' ? 'awayTeamId' : 'localTeamId';
    const changedTeamId = this.form.controls[changedControlName].value;
    const oppositeTeamId = this.form.controls[oppositeControlName].value;

    if (!changedTeamId || !oppositeTeamId) {
      return;
    }

    const oppositeSelectionIsValid =
      changedControlName === 'localTeamId'
        ? this.canSelectAwayTeam(oppositeTeamId, changedTeamId)
        : this.canSelectLocalTeam(oppositeTeamId, changedTeamId);

    if (!oppositeSelectionIsValid) {
      this.form.controls[oppositeControlName].setValue('', { emitEvent: false });
    }
  }
}
