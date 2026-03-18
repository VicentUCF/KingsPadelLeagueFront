import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

import { BackofficeStandingsStore } from '../../state/backoffice-standings.store';

@Component({
  selector: 'app-backoffice-standings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-standings-page' },
  imports: [LoadFeedbackComponent, LoadingStateComponent],
  templateUrl: './backoffice-standings-page.component.html',
  styleUrl: './backoffice-standings-page.component.scss',
})
export class BackofficeStandingsPageComponent implements OnInit {
  protected readonly standingsStore = inject(BackofficeStandingsStore);

  ngOnInit(): void {
    void this.standingsStore.load();
  }

  protected reloadStandings(): void {
    void this.standingsStore.load(true);
  }
}
