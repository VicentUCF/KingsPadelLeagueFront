import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { ModalShellComponent } from './modal-shell.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalShellComponent],
  template: `
    <button type="button" (click)="open()">Abrir modal</button>

    <app-modal-shell [isOpen]="isOpen()" title="Editar season" (closed)="close()">
      <div modalBody>
        <p>Contenido del modal</p>
      </div>

      <div modalFooter>
        <button type="button" (click)="close()">Cancelar</button>
      </div>
    </app-modal-shell>
  `,
})
class ModalShellHostComponent {
  readonly isOpen = signal(false);

  open(): void {
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
  }
}

describe('ModalShellComponent', () => {
  it('traps focus while open and restores it when closed', async () => {
    const { fixture } = await render(ModalShellHostComponent);
    const trigger = screen.getByRole('button', { name: /Abrir modal/i });

    trigger.focus();
    await fireEvent.click(trigger);
    fixture.detectChanges();

    expect(await screen.findByRole('dialog', { name: /Editar season/i })).toBeVisible();

    const activeElement = document.activeElement;

    expect(activeElement instanceof HTMLElement).toBe(true);

    await fireEvent.keyDown(activeElement as HTMLElement, { key: 'Escape' });
    fixture.detectChanges();

    expect(screen.queryByRole('dialog', { name: /Editar season/i })).not.toBeInTheDocument();
    expect(document.activeElement).toBe(trigger);
  });

  it('has no accessibility violations while open', async () => {
    const { container, fixture } = await render(ModalShellHostComponent);

    await fireEvent.click(screen.getByRole('button', { name: /Abrir modal/i }));
    fixture.detectChanges();

    await screen.findByRole('dialog', { name: /Editar season/i });

    expect(await axe(container)).toHaveNoViolations();
  });
});
