import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

type LoadFeedbackTone = 'warning' | 'error';

@Component({
  selector: 'app-load-feedback',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'load-feedback c-surface-card',
    '[class.load-feedback--warning]': 'tone() === "warning"',
    '[class.load-feedback--error]': 'tone() === "error"',
    '[attr.role]': 'tone() === "error" ? "alert" : "status"',
  },
  templateUrl: './load-feedback.component.html',
  styleUrl: './load-feedback.component.scss',
})
export class LoadFeedbackComponent {
  readonly message = input.required<string>();
  readonly retryLabel = input('Reintentar');
  readonly tone = input<LoadFeedbackTone>('error');
  readonly retry = output<void>();

  protected emitRetry(): void {
    this.retry.emit();
  }
}
