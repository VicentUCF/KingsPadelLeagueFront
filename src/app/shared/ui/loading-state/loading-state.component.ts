import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

type LoadingStateVariant = 'page' | 'panel' | 'table' | 'cards';

const DEFAULT_HEADINGS: Record<LoadingStateVariant, string> = {
  page: 'Cargando contenido',
  panel: 'Cargando seccion',
  table: 'Cargando tabla',
  cards: 'Cargando elementos',
};

const DEFAULT_HINTS: Record<LoadingStateVariant, string> = {
  page: 'Estamos preparando la vista con los ultimos datos disponibles.',
  panel: 'Estamos preparando esta seccion.',
  table: 'Estamos preparando la informacion tabular.',
  cards: 'Estamos preparando las tarjetas de contenido.',
};

@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'loading-state c-surface-card',
    '[class.loading-state--page]': 'variant() === "page"',
    '[class.loading-state--panel]': 'variant() === "panel"',
    '[class.loading-state--table]': 'variant() === "table"',
    '[class.loading-state--cards]': 'variant() === "cards"',
    '[attr.aria-busy]': '"true"',
    '[attr.aria-live]': '"polite"',
  },
  templateUrl: './loading-state.component.html',
  styleUrl: './loading-state.component.scss',
})
export class LoadingStateComponent {
  readonly variant = input<LoadingStateVariant>('panel');
  readonly heading = input<string | null>(null);
  readonly hint = input<string | null>(null);
  readonly cardCount = input(3);
  readonly lineCount = input(4);
  readonly showToolbar = input(false, { transform: booleanAttribute });
  readonly showMetrics = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | null>(null);

  protected readonly resolvedHeading = computed(
    () => this.heading() ?? DEFAULT_HEADINGS[this.variant()],
  );
  protected readonly resolvedHint = computed(() => this.hint() ?? DEFAULT_HINTS[this.variant()]);
  protected readonly accessibleLabel = computed(
    () => this.ariaLabel() ?? `${this.resolvedHeading()}. ${this.resolvedHint()}`,
  );
  protected readonly resolvedCardCount = computed(() => Math.max(this.cardCount(), 1));
  protected readonly resolvedLineCount = computed(() => Math.max(this.lineCount(), 2));
  protected readonly metricPlaceholders = computed(() =>
    Array.from(
      { length: this.showMetrics() || this.variant() === 'page' ? 3 : 0 },
      (_, index) => index,
    ),
  );
  protected readonly toolbarPlaceholders = computed(() =>
    Array.from(
      { length: this.showToolbar() || this.variant() === 'cards' ? 2 : 0 },
      (_, index) => index,
    ),
  );
  protected readonly cardPlaceholders = computed(() =>
    Array.from({ length: this.resolvedCardCount() }, (_, index) => index),
  );
  protected readonly linePlaceholders = computed(() =>
    Array.from({ length: this.resolvedLineCount() }, (_, index) => index),
  );
}
