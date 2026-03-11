import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';

import {
  type MatchdayEncounterSummaryViewModel,
  type MatchdayStatusTone,
  toMatchdayEncounterSummaryViewModel,
  toMatchdayStatusLabel,
  toMatchdayStatusTone,
} from './league-matchday-ui.viewmodel';

export interface LeagueMatchdaysPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly publishedMatchdaysLabel: string;
  readonly currentMatchdayLabel: string;
  readonly matchdays: readonly MatchdayCardViewModel[];
}

export interface MatchdayCardViewModel {
  readonly id: string;
  readonly label: string;
  readonly dateLabel: string;
  readonly statusLabel: string;
  readonly statusTone: MatchdayStatusTone;
  readonly encounterCountLabel: string;
  readonly byeDescription: string | null;
  readonly detailLink: string;
  readonly detailLinkLabel: string;
  readonly isCurrent: boolean;
  readonly encounters: readonly MatchdayEncounterSummaryViewModel[];
}

export function toLeagueMatchdaysPageViewModel(
  matchdays: readonly LeagueMatchday[],
): LeagueMatchdaysPageViewModel {
  const currentMatchday = matchdays.find((matchday) => matchday.status === 'current') ?? null;

  return {
    eyebrow: 'Jornadas',
    title: 'Calendario por jornadas',
    description:
      'Explora cada jornada con los cruces de equipos y abre el detalle para consultar los resultados publicados por pareja.',
    publishedMatchdaysLabel: `${matchdays.length} jornadas publicadas`,
    currentMatchdayLabel: currentMatchday
      ? `Jornada en foco: ${currentMatchday.label}`
      : 'No hay una jornada en juego ahora mismo',
    matchdays: matchdays.map(toMatchdayCardViewModel),
  };
}

function toMatchdayCardViewModel(matchday: LeagueMatchday): MatchdayCardViewModel {
  return {
    id: matchday.id,
    label: matchday.label,
    dateLabel: matchday.dateLabel,
    statusLabel: toMatchdayStatusLabel(matchday.status),
    statusTone: toMatchdayStatusTone(matchday.status),
    encounterCountLabel: `${matchday.encounters.length} cruces`,
    byeDescription: matchday.byeTeam ? `Descansa ${matchday.byeTeam.teamName}` : null,
    detailLink: `/jornadas/${matchday.id}`,
    detailLinkLabel: `Ver ${matchday.label.toLowerCase()}`,
    isCurrent: matchday.status === 'current',
    encounters: matchday.encounters.map(toMatchdayEncounterSummaryViewModel),
  };
}
