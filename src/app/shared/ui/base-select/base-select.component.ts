import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';

import { FormFieldComponent } from '../form-field/form-field.component';
import {
  type BaseInputSize,
  type BaseInputState,
  type BaseInputVariant,
  type BaseInputWidth,
} from '../base-input/base-input.types';

const BASE_SELECT_ID_PREFIX = 'base-select';

let nextBaseSelectId = 0;

@Component({
  selector: 'app-base-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': 'hostDisplay()',
    '[style.width]': 'hostWidth()',
  },
  imports: [FormFieldComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseSelectComponent),
      multi: true,
    },
  ],
  templateUrl: './base-select.component.html',
})
export class BaseSelectComponent implements ControlValueAccessor {
  readonly id = input<string | null>(null);
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly labelHidden = input(false, { transform: booleanAttribute });
  readonly helperText = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly successMessage = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string | null>(null);
  readonly variant = input<BaseInputVariant>('default');
  readonly size = input<BaseInputSize>('md');
  readonly width = input<BaseInputWidth>('full');
  readonly status = input<BaseInputState>('default');
  readonly name = input<string | null>(null);

  private readonly generatedId = `${BASE_SELECT_ID_PREFIX}-${++nextBaseSelectId}`;
  private readonly cvaDisabled = signal(false);
  private readonly selectValue = signal('');

  protected readonly controlId = computed(() => this.id() ?? this.generatedId);
  protected readonly helperId = computed(() => `${this.controlId()}-helper`);
  protected readonly messageId = computed(() => `${this.controlId()}-message`);
  protected readonly resolvedState = computed<BaseInputState>(() => {
    if (this.errorMessage()) {
      return 'error';
    }

    if (this.successMessage()) {
      return 'success';
    }

    return this.status();
  });
  protected readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());
  protected readonly describedBy = computed(() => {
    const ids: string[] = [];

    if (this.helperText()) {
      ids.push(this.helperId());
    }

    if (this.errorMessage() || this.successMessage()) {
      ids.push(this.messageId());
    }

    return ids.length > 0 ? ids.join(' ') : null;
  });
  protected readonly effectiveAriaLabel = computed(() =>
    this.label() ? null : (this.ariaLabel() ?? this.placeholder()),
  );
  protected readonly hostDisplay = computed(() =>
    this.width() === 'auto' ? 'inline-block' : 'block',
  );
  protected readonly hostWidth = computed(() => (this.width() === 'full' ? '100%' : 'auto'));
  protected readonly value = computed(() => this.selectValue());

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.selectValue.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected handleChange(event: Event): void {
    const element = event.target;

    if (!(element instanceof HTMLSelectElement)) {
      return;
    }

    this.selectValue.set(element.value);
    this.onChange(element.value);
  }

  protected handleBlur(): void {
    this.onTouched();
  }
}
