import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Shield } from 'lucide-angular';

@Component({
  selector: 'app-bye-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'bye-card c-surface-card',
  },
  imports: [LucideAngularModule],
  templateUrl: './bye-card.component.html',
  styleUrl: './bye-card.component.scss',
})
export class ByeCardComponent {
  readonly teamName = input.required<string>();
  readonly description = input.required<string>();

  protected readonly shieldIcon = Shield;
}
