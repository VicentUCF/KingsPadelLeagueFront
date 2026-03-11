import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, type ControlValueAccessor } from '@angular/forms';
import { LucideAngularModule, type LucideIconData } from 'lucide-angular';

import { FormFieldComponent } from '../form-field/form-field.component';
import {
  type BaseInputSize,
  type BaseInputState,
  type BaseInputType,
  type BaseInputVariant,
  type BaseInputWidth,
} from './base-input.types';

const BASE_INPUT_ID_PREFIX = 'base-input';

let nextBaseInputId = 0;

@Component({
  selector: 'app-base-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.display]': 'hostDisplay()',
    '[style.width]': 'hostWidth()',
  },
  imports: [FormFieldComponent, LucideAngularModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => BaseInputComponent),
      multi: true,
    },
  ],
  templateUrl: './base-input.component.html',
})
export class BaseInputComponent implements ControlValueAccessor {
  readonly id = input<string | null>(null);
  readonly label = input<string | null>(null);
  readonly ariaLabel = input<string | null>(null);
  readonly labelHidden = input(false, { transform: booleanAttribute });
  readonly helperText = input<string | null>(null);
  readonly errorMessage = input<string | null>(null);
  readonly successMessage = input<string | null>(null);
  readonly required = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readOnly = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly placeholder = input<string | null>(null);
  readonly type = input<BaseInputType>('text');
  readonly variant = input<BaseInputVariant>('default');
  readonly size = input<BaseInputSize>('md');
  readonly width = input<BaseInputWidth>('full');
  readonly status = input<BaseInputState>('default');
  readonly name = input<string | null>(null);
  readonly autocomplete = input<string | null>(null);
  readonly inputMode = input<string | null>(null);
  readonly maxLength = input<number | null>(null);
  readonly minLength = input<number | null>(null);
  readonly min = input<number | string | null>(null);
  readonly max = input<number | string | null>(null);
  readonly step = input<number | string | null>(null);
  readonly prefix = input<string | null>(null);
  readonly suffix = input<string | null>(null);
  readonly leadingIcon = input<LucideIconData | null>(null);
  readonly trailingIcon = input<LucideIconData | null>(null);
  readonly actionIcon = input<LucideIconData | null>(null);
  readonly actionLabel = input<string | null>(null);
  readonly actionPressed = input<boolean | null>(null);
  readonly actionDisabled = input(false, { transform: booleanAttribute });

  readonly actionTriggered = output<void>();

  private readonly generatedId = `${BASE_INPUT_ID_PREFIX}-${++nextBaseInputId}`;
  private readonly cvaDisabled = signal(false);
  private readonly inputValue = signal('');

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
  protected readonly isActionDisabled = computed(
    () => this.isDisabled() || this.loading() || this.actionDisabled(),
  );
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
  protected readonly iconSize = computed(() => {
    switch (this.size()) {
      case 'sm':
        return 16;
      case 'lg':
        return 20;
      default:
        return 18;
    }
  });
  protected readonly hasAction = computed(
    () => Boolean(this.actionIcon()) && Boolean(this.actionLabel()),
  );
  protected readonly value = computed(() => this.inputValue());

  private onChange: (value: number | string | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: number | string | null): void {
    this.inputValue.set(normalizeInputValue(value));
  }

  registerOnChange(fn: (value: number | string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected handleInput(event: Event): void {
    const element = event.target;

    if (!(element instanceof HTMLInputElement)) {
      return;
    }

    this.inputValue.set(element.value);
    this.onChange(parseInputValue(element.value, this.type()));
  }

  protected handleBlur(): void {
    this.onTouched();
  }

  protected handleActionMouseDown(event: MouseEvent): void {
    event.preventDefault();
  }

  protected triggerAction(): void {
    if (!this.hasAction() || this.isActionDisabled()) {
      return;
    }

    this.actionTriggered.emit();
  }
}

function normalizeInputValue(value: number | string | null): string {
  if (value === null || value === undefined) {
    return '';
  }

  return `${value}`;
}

function parseInputValue(value: string, type: BaseInputType): number | string | null {
  if (type !== 'number') {
    return value;
  }

  if (value.length === 0) {
    return null;
  }

  const parsedValue = Number(value);

  return Number.isNaN(parsedValue) ? null : parsedValue;
}
