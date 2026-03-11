import { type LeagueMatchday } from '@features/league-home/domain/entities/league-matchday';

import {
  type MatchdayEncounterSummaryViewModel,
  type MatchdayStatusTone,
  toMatchdayEncounterSummaryViewModel,
  toMatchdayStatusLabel,
  toMatchdayStatusTone,
} from './league-matchday-ui.viewmodel';

export interface LeagueMatchdayDetailPageViewModel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly dateLabel: string;
  readonly statusLabel: string;
  readonly statusTone: MatchdayStatusTone;
  readonly summaryItems: readonly MatchdaySummaryItemViewModel[];
  readonly byeTeam: MatchdayByeViewModel | null;
  readonly encounters: readonly MatchdayEncounterDetailViewModel[];
}

export interface MatchdaySummaryItemViewModel {
  readonly label: string;
  readonly value: string;
}

export interface MatchdayByeViewModel {
  readonly teamName: string;
  readonly description: string;
}

export interface MatchdayEncounterDetailViewModel extends MatchdayEncounterSummaryViewModel {
  readonly pairResults: readonly MatchdayPairResultViewModel[];
  readonly emptyPairResultsMessage: string;
}

export interface MatchdayPairResultViewModel {
  readonly id: string;
  readonly label: string;
  readonly homeScoreLabel: string;
  readonly awayScoreLabel: string;
  readonly homePair: MatchdayPairLineupViewModel;
  readonly awayPair: MatchdayPairLineupViewModel;
  readonly winnerTeamName: string | null;
  readonly winnerSide: 'home' | 'away' | 'none';
}

export interface MatchdayPairLineupViewModel {
  readonly label: string;
  readonly players: readonly MatchdayPairPlayerViewModel[];
}

export interface MatchdayPairPlayerViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly roleLabel: string;
}

export function toLeagueMatchdayDetailPageViewModel(
  matchdays: readonly LeagueMatchday[],
  matchdayId: string,
): LeagueMatchdayDetailPageViewModel | null {
  const matchday = matchdays.find((entry) => entry.id === matchdayId);

  if (!matchday) {
    return null;
  }

  return {
    eyebrow: 'Jornadas',
    title: matchday.label,
    description: toMatchdayDescription(matchday.status),
    dateLabel: matchday.dateLabel,
    statusLabel: toMatchdayStatusLabel(matchday.status),
    statusTone: toMatchdayStatusTone(matchday.status),
    summaryItems: [
      {
        label: 'Cruces',
        value: `${matchday.encounters.length}`,
      },
      {
        label: 'Partidos resueltos',
        value: `${countResolvedPairs(matchday)}`,
      },
      {
        label: 'Descansa',
        value: matchday.byeTeam?.teamName ?? 'Sin descanso',
      },
    ],
    byeTeam: matchday.byeTeam
      ? {
          teamName: matchday.byeTeam.teamName,
          description: `${matchday.label} · Descansa`,
        }
      : null,
    encounters: matchday.encounters.map((encounter) => {
      const encounterSummary = toMatchdayEncounterSummaryViewModel(encounter);

      return {
        ...encounterSummary,
        pairResults: encounter.pairResults.map((pairResult) => ({
          id: pairResult.id,
          label: pairResult.label,
          homeScoreLabel: pairResult.homeScoreLabel,
          awayScoreLabel: pairResult.awayScoreLabel,
          homePair: {
            label: pairResult.homePair.label,
            players: pairResult.homePair.players.map((player) => ({
              id: player.id,
              displayName: player.displayName,
              roleLabel: player.roleLabel,
            })),
          },
          awayPair: {
            label: pairResult.awayPair.label,
            players: pairResult.awayPair.players.map((player) => ({
              id: player.id,
              displayName: player.displayName,
              roleLabel: player.roleLabel,
            })),
          },
          winnerTeamName:
            pairResult.winnerTeamId === encounter.homeTeamId
              ? encounter.homeTeamName
              : pairResult.winnerTeamId === encounter.awayTeamId
                ? encounter.awayTeamName
                : null,
          winnerSide:
            pairResult.winnerTeamId === encounter.homeTeamId
              ? 'home'
              : pairResult.winnerTeamId === encounter.awayTeamId
                ? 'away'
                : 'none',
        })),
        emptyPairResultsMessage:
          encounter.status === 'upcoming'
            ? 'Resultados pendientes de publicación.'
            : 'Todavía no hay resultados publicados por pareja.',
      };
    }),
  };
}

function toMatchdayDescription(status: LeagueMatchday['status']): string {
  switch (status) {
    case 'completed':
      return 'Consulta todos los cruces cerrados y el detalle de resultados por pareja.';
    case 'current':
      return 'Sigue la jornada en juego con el marcador global de cada cruce y los resultados ya publicados.';
    case 'upcoming':
      return 'Revisa los enfrentamientos programados y vuelve aquí para consultar los resultados cuando se publiquen.';
  }
}

function countResolvedPairs(matchday: LeagueMatchday): number {
  return matchday.encounters.reduce((total, encounter) => {
    return (
      total + encounter.pairResults.filter((pairResult) => pairResult.winnerTeamId !== null).length
    );
  }, 0);
}
