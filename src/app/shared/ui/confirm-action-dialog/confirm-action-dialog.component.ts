import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { ModalShellComponent } from '../modal-shell/modal-shell.component';

@Component({
  selector: 'app-confirm-action-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'confirm-action-dialog',
  },
  imports: [ModalShellComponent],
  templateUrl: './confirm-action-dialog.component.html',
  styleUrl: './confirm-action-dialog.component.scss',
})
export class ConfirmActionDialogComponent {
  readonly isOpen = input(false);
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly confirmLabel = input('Confirmar');
  readonly cancelLabel = input('Cancelar');
  readonly confirmTone = input<'neutral' | 'danger'>('danger');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected cancel(): void {
    this.cancelled.emit();
  }

  protected confirm(): void {
    this.confirmed.emit();
  }
}
