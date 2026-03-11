import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type BaseInputSize, type BaseInputWidth } from '../base-input/base-input.types';

@Component({
  selector: 'app-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    style: 'display: block;',
  },
  templateUrl: './form-field.component.html',
})
export class FormFieldComponent {
  readonly controlId = input.required<string>();
  readonly helperId = input.required<string>();
  readonly messageId = input.required<string>();
  readonly label = input<string | null>(null);
  readonly labelHidden = input(false);
  readonly helperText = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly successMessage = input<string | null>(null);
  readonly required = input(false);
  readonly size = input<BaseInputSize>('md');
  readonly width = input<BaseInputWidth>('full');

  protected readonly message = computed(() => this.errorMessage() ?? this.successMessage());
  protected readonly hasError = computed(() => Boolean(this.errorMessage()));
  protected readonly hasSuccess = computed(
    () => !this.errorMessage() && Boolean(this.successMessage()),
  );
}
