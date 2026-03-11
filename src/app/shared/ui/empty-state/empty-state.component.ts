import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CircleDot, LucideAngularModule, type LucideIconData } from 'lucide-angular';

export interface EmptyStateAction {
  readonly label: string;
  readonly href: string;
  readonly tone: 'primary' | 'secondary';
  readonly icon?: LucideIconData | null;
}

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'empty-state c-surface-card',
    '[class.empty-state--compact]': 'layout() === "compact"',
    '[class.empty-state--feature]': 'layout() === "feature"',
    '[class.empty-state--with-actions]': 'actions().length > 0',
    '[class.empty-state--with-highlights]': 'highlights().length > 0',
  },
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly eyebrow = input<string | null>(null);
  readonly icon = input<LucideIconData | null>(null);
  readonly highlights = input<readonly string[]>([]);
  readonly actions = input<readonly EmptyStateAction[]>([]);
  readonly layout = input<'compact' | 'feature'>('compact');

  protected readonly resolvedIcon = computed(() => this.icon() ?? CircleDot);
}
