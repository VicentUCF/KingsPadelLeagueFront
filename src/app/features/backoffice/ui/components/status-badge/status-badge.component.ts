import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { type StatusBadgeTone } from '../../models/status-badge-tone';

@Component({
  selector: 'app-status-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'status-badge-host',
  },
  templateUrl: './status-badge.component.html',
  styleUrl: './status-badge.component.scss',
})
export class StatusBadgeComponent {
  readonly label = input.required<string>();
  readonly tone = input<StatusBadgeTone>('neutral');

  protected readonly classes = computed(() => `status-badge status-badge--${this.tone()}`);
}
