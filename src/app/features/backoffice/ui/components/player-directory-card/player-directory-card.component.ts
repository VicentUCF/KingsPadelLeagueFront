import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { type BackofficePlayerCardViewModel } from '../../models/backoffice-players.viewmodel';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { BaseModalComponent } from '@app/shared/ui/base-modal/base-modal.component';

@Component({
  selector: 'app-player-directory-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'player-directory-card c-surface-card',
  },
  imports: [StatusBadgeComponent, BaseModalComponent],
  templateUrl: './player-directory-card.component.html',
  styleUrl: './player-directory-card.component.scss',
})
export class PlayerDirectoryCardComponent {
  readonly player = input.required<BackofficePlayerCardViewModel>();

  protected readonly detailOpen = signal(false);

  protected readonly initials = computed(() => {
    return this.player().title.slice(0, 2).toUpperCase();
  });

  protected readonly winsCount = computed(() => {
    const match = /^(\d+)V/.exec(this.player().historyLabel);
    return match?.[1] ?? '0';
  });

  protected readonly lossesCount = computed(() => {
    const match = /(\d+)D/.exec(this.player().historyLabel);
    return match?.[1] ?? '0';
  });

  protected openDetail(): void {
    this.detailOpen.set(true);
  }

  protected closeDetail(): void {
    this.detailOpen.set(false);
  }
}
