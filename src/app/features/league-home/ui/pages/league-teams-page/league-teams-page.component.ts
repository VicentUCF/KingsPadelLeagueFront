import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  type OnInit,
} from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { LucideAngularModule, Shield } from 'lucide-angular';

import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';

import { TeamSelectorComponent } from '../../components/team-selector/team-selector.component';
import { TeamShowcaseHeroComponent } from '../../components/team-showcase-hero/team-showcase-hero.component';
import {
  toLeagueTeamsPageViewModel,
  type LeagueTeamsPageViewModel,
} from '../../models/league-teams.viewmodel';
import { LeagueHomeStore } from '../../state/league-home.store';

@Component({
  selector: 'app-league-teams-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'league-teams-page',
  },
  imports: [
    EmptyStateComponent,
    LucideAngularModule,
    TeamSelectorComponent,
    TeamShowcaseHeroComponent,
  ],
  providers: [LeagueHomeStore],
  templateUrl: './league-teams-page.component.html',
  styleUrl: './league-teams-page.component.scss',
})
export class LeagueTeamsPageComponent implements OnInit {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  protected readonly store = inject(LeagueHomeStore);
  protected readonly teamsIcon = Shield;
  protected readonly selectedTeamSlug = signal<string | null>(null);

  protected readonly viewModel = computed<LeagueTeamsPageViewModel | null>(() => {
    const snapshot = this.store.snapshot();

    return snapshot ? toLeagueTeamsPageViewModel(snapshot) : null;
  });

  protected readonly selectedTeam = computed(() => {
    const viewModel = this.viewModel();

    if (!viewModel) {
      return null;
    }

    const selectedTeamSlug = this.selectedTeamSlug();

    return (
      viewModel.teams.find((team) => team.slug === selectedTeamSlug) ??
      viewModel.teams.find((team) => team.slug === viewModel.initialSelectedSlug) ??
      null
    );
  });

  constructor() {
    effect(() => {
      const viewModel = this.viewModel();

      if (viewModel && !this.selectedTeamSlug()) {
        this.selectedTeamSlug.set(viewModel.initialSelectedSlug);
      }
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Equipos | KingsPadelLeague');
    this.meta.updateTag({
      name: 'description',
      content:
        'Conoce los equipos participantes de la KingsPadelLeague, su plantilla y su situación actual en la temporada.',
    });

    void this.store.load();
  }

  protected selectTeam(teamSlug: string): void {
    this.selectedTeamSlug.set(teamSlug);
  }

  protected reloadSnapshot(): void {
    void this.store.load();
  }
}
