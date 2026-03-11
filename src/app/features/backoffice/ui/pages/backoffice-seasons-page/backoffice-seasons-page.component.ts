import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { SeasonCardComponent } from '../../components/season-card/season-card.component';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';

@Component({
  selector: 'app-backoffice-seasons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'backoffice-seasons-page',
  },
  imports: [EmptyStateComponent, SeasonCardComponent],
  providers: [BackofficeSeasonsStore],
  templateUrl: './backoffice-seasons-page.component.html',
  styleUrl: './backoffice-seasons-page.component.scss',
})
export class BackofficeSeasonsPageComponent implements OnInit {
  protected readonly store = inject(BackofficeSeasonsStore);

  ngOnInit(): void {
    void this.store.load();
  }
}
