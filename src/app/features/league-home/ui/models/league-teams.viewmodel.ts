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
    title: 'Equipos participantes',
    description:
      'Consulta los equipos participantes, su plantilla y su situación actual dentro de la KingsPadelLeague.',
    teams,
    initialSelectedSlug: teams[0]?.slug ?? null,
  };
}
