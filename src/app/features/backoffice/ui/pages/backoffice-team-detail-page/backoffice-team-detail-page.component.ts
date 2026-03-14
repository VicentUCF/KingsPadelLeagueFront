import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import type {
  BackofficePlayer,
  BackofficePlayerPosition,
} from '@features/backoffice/domain/entities/backoffice-player';
import { BackofficePlayersStore } from '../../state/backoffice-players.store';
import { BackofficeTeamsStore } from '../../state/backoffice-teams.store';

@Component({
  selector: 'app-backoffice-team-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'backoffice-team-detail-page' },
  imports: [RouterLink],
  templateUrl: './backoffice-team-detail-page.component.html',
  styleUrl: './backoffice-team-detail-page.component.scss',
})
export class BackofficeTeamDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  protected readonly teamsStore = inject(BackofficeTeamsStore);
  protected readonly playersStore = inject(BackofficePlayersStore);

  protected readonly teamId = signal('');

  protected readonly teamCard = computed(
    () =>
      this.teamsStore.buildCards(this.playersStore.players()).find((c) => c.id === this.teamId()) ??
      null,
  );

  protected readonly roster = computed(() => {
    const players = this.playersStore.players().filter((p) => p.teamId === this.teamId());
    return [...players].sort((a, b) => {
      if (a.isPresident && !b.isPresident) return -1;
      if (!a.isPresident && b.isPresident) return 1;
      return b.wonGames + b.lostGames - (a.wonGames + a.lostGames);
    });
  });

  protected readonly totalWon = computed(() =>
    this.roster().reduce((sum, p) => sum + p.wonGames, 0),
  );

  protected readonly totalLost = computed(() =>
    this.roster().reduce((sum, p) => sum + p.lostGames, 0),
  );

  ngOnInit(): void {
    this.teamId.set(this.route.snapshot.paramMap.get('teamId') ?? '');
    void this.teamsStore.load();
    void this.playersStore.load();
  }

  protected positionLabel(pos: BackofficePlayerPosition): string {
    switch (pos) {
      case 'left':
        return 'Revés';
      case 'right':
        return 'Drive';
      case 'both':
        return 'Ambas';
    }
  }

  protected winRate(player: BackofficePlayer): string {
    const total = player.wonGames + player.lostGames;
    if (total === 0) return '—';
    return `${Math.round((player.wonGames / total) * 100)}%`;
  }
}
