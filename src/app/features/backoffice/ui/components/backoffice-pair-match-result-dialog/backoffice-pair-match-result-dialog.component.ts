import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import type { BackofficePairMatchSetResult } from '@features/backoffice/domain/entities/backoffice-pair-match';
import { ModalShellComponent } from '@shared/ui/modal-shell/modal-shell.component';

interface PairMatchResultValue {
  readonly setsResult: readonly BackofficePairMatchSetResult[];
}

type SetFormGroup = FormGroup<{
  local: FormControl<number | null>;
  away: FormControl<number | null>;
}>;

@Component({
  selector: 'app-backoffice-pair-match-result-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-pair-match-result-dialog' },
  imports: [ModalShellComponent, ReactiveFormsModule],
  templateUrl: './backoffice-pair-match-result-dialog.component.html',
  styleUrl: './backoffice-pair-match-result-dialog.component.scss',
})
export class BackofficePairMatchResultDialogComponent {
  readonly isOpen = input(false);
  readonly isSubmitting = input(false);
  readonly submissionError = input<string | null>(null);
  readonly initialSets = input<readonly BackofficePairMatchSetResult[]>([]);

  readonly cancelled = output<void>();
  readonly submitted = output<PairMatchResultValue>();

  protected readonly sets = signal<SetFormGroup[]>([]);

  constructor() {
    effect(() => {
      if (!this.isOpen()) return;

      const seed = this.initialSets();
      this.sets.set(
        (seed.length > 0 ? seed : [{ local: 6, away: 4 }]).map((set) => this.createSetForm(set)),
      );
    });
  }

  protected close(): void {
    this.cancelled.emit();
  }

  protected addSet(): void {
    this.sets.update((sets) => [...sets, this.createSetForm({ local: 6, away: 4 })]);
  }

  protected removeSet(index: number): void {
    this.sets.update((sets) => sets.filter((_, currentIndex) => currentIndex !== index));
  }

  protected submit(): void {
    const setsResult = this.sets()
      .map((form) => form.getRawValue())
      .filter((set) => set.local != null && set.away != null)
      .map((set) => ({ local: Number(set.local), away: Number(set.away) }));

    if (setsResult.length === 0) {
      return;
    }

    this.submitted.emit({ setsResult });
  }

  private createSetForm(set: BackofficePairMatchSetResult): SetFormGroup {
    return new FormGroup({
      local: new FormControl(set.local),
      away: new FormControl(set.away),
    });
  }
}
