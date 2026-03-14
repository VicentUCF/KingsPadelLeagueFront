import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { BackofficeStandingsStore } from '../../state/backoffice-standings.store';

@Component({
  selector: 'app-backoffice-standings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-standings-page' },
  imports: [],
  templateUrl: './backoffice-standings-page.component.html',
  styleUrl: './backoffice-standings-page.component.scss',
})
export class BackofficeStandingsPageComponent implements OnInit {
  protected readonly standingsStore = inject(BackofficeStandingsStore);

  ngOnInit(): void {
    void this.standingsStore.load();
  }
}
