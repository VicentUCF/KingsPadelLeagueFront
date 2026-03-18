import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { StatusBadgeComponent } from '../../components/status-badge/status-badge.component';
import { LoadFeedbackComponent } from '@shared/ui/load-feedback/load-feedback.component';
import { LoadingStateComponent } from '@shared/ui/loading-state/loading-state.component';

@Component({
  selector: 'app-backoffice-matchdays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-matchdays-page' },
  imports: [LoadFeedbackComponent, LoadingStateComponent, RouterLink, StatusBadgeComponent],
  templateUrl: './backoffice-matchdays-page.component.html',
  styleUrl: './backoffice-matchdays-page.component.scss',
})
export class BackofficeMatchdaysPageComponent implements OnInit {
  protected readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  protected readonly sessionStore = inject(BackofficeSessionStore);

  ngOnInit(): void {
    void this.matchdaysStore.load();
  }

  protected reloadMatchdays(): void {
    void this.matchdaysStore.load(true);
  }
}
