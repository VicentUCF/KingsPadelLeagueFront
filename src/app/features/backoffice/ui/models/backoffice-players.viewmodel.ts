import {
  type BackofficePlayerDetail,
  type BackofficePlayerStatus,
  type BackofficePlayerSummary,
} from '../../domain/entities/backoffice-player.entity';
import { type StatusBadgeTone } from './status-badge-tone';

export interface BackofficePlayerCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly nickLabel: string;
  readonly avatarPath: string | null;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly derivedTeamLabel: string;
  readonly historyLabel: string;
  readonly userLinkageLabel: string;
  readonly detailPath: string;
}

export interface BackofficePlayerDetailViewModel {
  readonly title: string;
  readonly nickLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly derivedTeamLabel: string;
  readonly preferredSideLabel: string;
  readonly userLinkageLabel: string;
  readonly memberships: readonly string[];
  readonly participations: readonly string[];
  readonly mvpNominations: readonly string[];
}

export function toBackofficePlayerCardViewModel(
  player: BackofficePlayerSummary,
): BackofficePlayerCardViewModel {
  return {
    id: player.id,
    title: player.fullName,
    nickLabel: `Nick: ${player.nickName}`,
    avatarPath: player.avatarPath,
    statusLabel: toPlayerStatusLabel(player.status),
    statusTone: toPlayerStatusTone(player.status),
    derivedTeamLabel: `Equipo actual derivado: ${player.derivedCurrentTeamName ?? 'Sin equipo activo'}`,
    historyLabel: `Histórico: ${player.historicalTeamNames.join(' · ')}`,
    userLinkageLabel: player.isUserLinked ? 'User vinculado' : 'Sin user vinculado',
    detailPath: `/backoffice/jugadores/${player.id}`,
  };
}

export function toBackofficePlayerDetailViewModel(
  player: BackofficePlayerDetail,
): BackofficePlayerDetailViewModel {
  return {
    title: player.fullName,
    nickLabel: `Nick: ${player.nickName}`,
    statusLabel: toPlayerStatusLabel(player.status),
    statusTone: toPlayerStatusTone(player.status),
    derivedTeamLabel: `Equipo actual derivado: ${player.derivedCurrentTeamName ?? 'Sin equipo activo'}`,
    preferredSideLabel: `Perfil de pista: ${player.preferredSideLabel}`,
    userLinkageLabel: player.linkedUserEmail
      ? `Cuenta vinculada: ${player.linkedUserEmail}`
      : 'Sin user vinculado',
    memberships: player.historicalMemberships.map(
      (membership) =>
        `${membership.seasonLabel} · ${membership.teamName} · ${membership.membershipLabel}`,
    ),
    participations: player.participations.map(
      (participation) => `${participation.label} · ${participation.resultLabel}`,
    ),
    mvpNominations: player.mvpNominations.map(
      (nomination) => `${nomination.label} · ${nomination.statusLabel}`,
    ),
  };
}

function toPlayerStatusLabel(status: BackofficePlayerStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activo';
    case 'INACTIVE':
      return 'Inactivo';
  }
}

function toPlayerStatusTone(status: BackofficePlayerStatus): StatusBadgeTone {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'INACTIVE':
      return 'warning';
  }
}
