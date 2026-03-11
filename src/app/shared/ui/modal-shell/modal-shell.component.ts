import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, input, output } from '@angular/core';
import { A11yModule } from '@angular/cdk/a11y';
import { LucideAngularModule, X } from 'lucide-angular';

let nextModalShellId = 0;

@Component({
  selector: 'app-modal-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'modal-shell',
  },
  imports: [A11yModule, LucideAngularModule],
  templateUrl: './modal-shell.component.html',
  styleUrl: './modal-shell.component.scss',
})
export class ModalShellComponent {
  private readonly document = inject(DOCUMENT);
  private readonly handleDocumentKeydown = (event: Event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Escape') {
      return;
    }

    event.preventDefault();
    this.requestClose();
  };
  private previousFocusedElement: HTMLElement | null = null;
  private wasOpen = false;

  readonly isOpen = input(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly closeLabel = input('Cerrar diálogo');
  readonly size = input<'default' | 'wide'>('default');
  readonly isDismissible = input(true);

  readonly closed = output<void>();

  protected readonly closeIcon = X;
  protected readonly titleId = `modal-shell-title-${nextModalShellId + 1}`;
  protected readonly descriptionId = `modal-shell-description-${nextModalShellId + 1}`;

  constructor() {
    nextModalShellId += 1;

    effect(() => {
      const isOpen = this.isOpen();

      if (isOpen && !this.wasOpen) {
        const activeElement = this.document.activeElement;

        this.previousFocusedElement = activeElement instanceof HTMLElement ? activeElement : null;
      }

      if (!isOpen && this.wasOpen && this.previousFocusedElement) {
        const elementToFocus = this.previousFocusedElement;

        queueMicrotask(() => {
          elementToFocus.focus();
        });
      }

      this.wasOpen = isOpen;
    });

    effect((onCleanup) => {
      if (!this.isOpen()) {
        return;
      }

      this.document.addEventListener('keydown', this.handleDocumentKeydown);
      onCleanup(() => {
        this.document.removeEventListener('keydown', this.handleDocumentKeydown);
      });
    });
  }

  protected requestClose(): void {
    if (!this.isDismissible()) {
      return;
    }

    this.closed.emit();
  }
}
