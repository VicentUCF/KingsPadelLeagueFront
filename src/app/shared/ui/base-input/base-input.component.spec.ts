import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { X } from 'lucide-angular';
import { axe } from 'jest-axe';

import { BaseInputComponent } from './base-input.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseInputComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-base-input
        formControlName="search"
        label="Buscar jugador"
        helperText="Filtra por nombre o equipo."
        [errorMessage]="showError() ? 'Necesitas al menos 3 caracteres.' : null"
        variant="filled"
        type="search"
        [actionIcon]="clearIcon"
        actionLabel="Limpiar búsqueda"
        (actionTriggered)="clearSearch()"
      />

      <app-base-input formControlName="seasonYear" label="Año" type="number" />
    </form>
  `,
})
class BaseInputHostComponent {
  readonly clearIcon = X;
  readonly showError = signal(false);
  readonly form = new FormGroup({
    search: new FormControl('', {
      nonNullable: true,
    }),
    seasonYear: new FormControl<number | null>(null),
  });

  clearSearch(): void {
    this.form.controls.search.setValue('');
  }
}

describe('BaseInputComponent', () => {
  it('associates label, helper text and error message accessibly', async () => {
    const { fixture } = await render(BaseInputHostComponent);
    const host = fixture.componentInstance;

    host.showError.set(true);
    fixture.detectChanges();

    const searchInput = screen.getByRole('searchbox', { name: /Buscar jugador/i });
    const helperText = screen.getByText(/Filtra por nombre o equipo/i);
    const errorMessage = screen.getByText(/Necesitas al menos 3 caracteres/i);
    const describedBy = searchInput.getAttribute('aria-describedby');

    expect(searchInput).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toContain(helperText.id);
    expect(describedBy).toContain(errorMessage.id);
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });

  it('writes numeric values back to the reactive form as numbers', async () => {
    const { fixture } = await render(BaseInputHostComponent);
    const host = fixture.componentInstance;
    const yearInput = screen.getByRole('spinbutton', { name: /Año/i });

    await fireEvent.input(yearInput, {
      target: { value: '2026' },
    });

    expect(host.form.controls.seasonYear.value).toBe(2026);

    await fireEvent.input(yearInput, {
      target: { value: '' },
    });

    expect(host.form.controls.seasonYear.value).toBeNull();
  });

  it('supports contextual trailing actions', async () => {
    const { fixture } = await render(BaseInputHostComponent);
    const host = fixture.componentInstance;

    host.form.controls.search.setValue('Titan');
    fixture.detectChanges();

    await fireEvent.click(screen.getByRole('button', { name: /Limpiar búsqueda/i }));

    expect(host.form.controls.search.value).toBe('');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(BaseInputHostComponent);

    expect(await axe(container)).toHaveNoViolations();
  });
});
