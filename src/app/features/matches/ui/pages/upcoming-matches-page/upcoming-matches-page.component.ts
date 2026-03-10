import { ChangeDetectionStrategy, Component, inject, type OnInit } from '@angular/core';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { UpcomingMatchCardComponent } from '../../components/upcoming-match-card/upcoming-match-card.component';
import { UpcomingMatchesStore } from '../../state/upcoming-matches.store';

@Component({
  selector: 'app-upcoming-matches-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'matches-page o-stack',
  },
  imports: [EmptyStateComponent, UpcomingMatchCardComponent],
  providers: [UpcomingMatchesStore],
  templateUrl: './upcoming-matches-page.component.html',
  styleUrl: './upcoming-matches-page.component.scss',
})
export class UpcomingMatchesPageComponent implements OnInit {
  protected readonly store = inject(UpcomingMatchesStore);

  ngOnInit(): void {
    void this.store.load();
  }

  protected reloadMatches(): void {
    void this.store.load();
  }
}
