import { type LeagueHomeSnapshot } from '@features/league-home/domain/entities/league-home-snapshot';

import {
  toTeamShowcaseViewModels,
  type TeamShowcaseViewModel,
} from './league-team-showcase.viewmodel';

export interface LeagueTeamsPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly teams: readonly TeamShowcaseViewModel[];
  readonly initialSelectedSlug: string | null;
}

export function toLeagueTeamsPageViewModel(snapshot: LeagueHomeSnapshot): LeagueTeamsPageViewModel {
  const teams = toTeamShowcaseViewModels(snapshot);

  return {
    eyebrow: 'Equipos',
    title: 'Identidad de equipos',
    description:
      'Explora la estética, el pulso competitivo y la plantilla completa de cada escudo de KingsPadelLeague.',
    teams,
    initialSelectedSlug: teams[0]?.slug ?? null,
  };
}
