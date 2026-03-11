import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { BaseTextareaComponent } from './base-textarea.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseTextareaComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-base-textarea
        formControlName="notes"
        label="Notas"
        helperText="Añade una nota por línea."
        [errorMessage]="showError() ? 'Las notas no pueden estar vacías.' : null"
        rows="6"
      />
    </form>
  `,
})
class BaseTextareaHostComponent {
  readonly showError = signal(false);
  readonly form = new FormGroup({
    notes: new FormControl('', {
      nonNullable: true,
    }),
  });
}

describe('BaseTextareaComponent', () => {
  it('updates the reactive form when the textarea changes', async () => {
    const { fixture } = await render(BaseTextareaHostComponent);
    const host = fixture.componentInstance;
    const textarea = screen.getByRole('textbox', { name: /Notas/i });

    await fireEvent.input(textarea, {
      target: { value: 'Primera nota' },
    });

    expect(host.form.controls.notes.value).toBe('Primera nota');
  });

  it('associates helper text and errors accessibly', async () => {
    const { fixture } = await render(BaseTextareaHostComponent);
    const host = fixture.componentInstance;

    host.showError.set(true);
    fixture.detectChanges();

    const textarea = screen.getByRole('textbox', { name: /Notas/i });
    const helperText = screen.getByText(/Añade una nota por línea/i);
    const errorMessage = screen.getByText(/Las notas no pueden estar vacías/i);
    const describedBy = textarea.getAttribute('aria-describedby');

    expect(textarea).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toContain(helperText.id);
    expect(describedBy).toContain(errorMessage.id);
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(BaseTextareaHostComponent);

    expect(await axe(container)).toHaveNoViolations();
  });
});
