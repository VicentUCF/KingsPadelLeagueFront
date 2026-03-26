import type { BackofficeLineup } from '@features/backoffice/domain/entities/backoffice-lineup';
import type { BackofficeMatch } from '@features/backoffice/domain/entities/backoffice-match';
import type { BackofficeTeam } from '@features/backoffice/domain/entities/backoffice-team';
import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeMatchCardViewModel {
  readonly matchId: string;
  readonly matchdayId: string;
  readonly localTeamId: string;
  readonly awayTeamId: string;
  readonly localTeamName: string;
  readonly awayTeamName: string;
  readonly scheduledLabel: string;
  readonly lineupStatus: 'pending' | 'submited' | 'no_lineup';
  readonly lineupStatusLabel: string;
  readonly lineupStatusTone: StatusBadgeTone;
  readonly pairCount: number;
  readonly localScore: number;
  readonly awayScore: number;
  readonly mvpId: string | null;
}

export function toBackofficeMatchCardViewModel(
  match: BackofficeMatch,
  localTeam: BackofficeTeam,
  awayTeam: BackofficeTeam,
  lineup?: BackofficeLineup,
  pairCount = 0,
): BackofficeMatchCardViewModel {
  const lineupStatus = lineup?.status ?? 'no_lineup';
  return {
    matchId: match.id,
    matchdayId: match.matchdayId,
    localTeamId: match.localTeamId,
    awayTeamId: match.awayTeamId,
    localTeamName: localTeam.name,
    awayTeamName: awayTeam.name,
    scheduledLabel: formatScheduledLabel(match.scheduledAt),
    lineupStatus,
    lineupStatusLabel: toLineupStatusLabel(lineupStatus),
    lineupStatusTone: toLineupStatusTone(lineupStatus),
    pairCount,
    localScore: match.localTeamScorePoints,
    awayScore: match.awayTeamScorePoints,
    mvpId: match.mvpId,
  };
}

function formatScheduledLabel(date: Date): string {
  return (
    date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    }) +
    ' · ' +
    date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  );
}

function toLineupStatusLabel(status: 'pending' | 'submited' | 'no_lineup'): string {
  switch (status) {
    case 'pending':
      return 'Pendiente';
    case 'submited':
      return 'Enviada';
    case 'no_lineup':
      return 'Sin alineación';
  }
}

function toLineupStatusTone(status: 'pending' | 'submited' | 'no_lineup'): StatusBadgeTone {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'submited':
      return 'success';
    case 'no_lineup':
      return 'neutral';
  }
}
