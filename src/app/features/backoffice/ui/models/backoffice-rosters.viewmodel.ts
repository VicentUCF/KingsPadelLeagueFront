import {
  type BackofficeRosterDetail,
  type BackofficeRosterMembershipStatus,
  type BackofficeRosterMembershipType,
  type BackofficeRosterStatus,
  type BackofficeRosterSummary,
  type BackofficeRosterTabId,
} from '../../domain/entities/backoffice-roster.entity';
import { type StatusBadgeTone } from './status-badge-tone';

export interface BackofficeRosterCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly regularSlotsLabel: string;
  readonly guestLabel: string;
  readonly pendingLabel: string;
  readonly validityLabel: string;
  readonly detailPath: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export interface BackofficeRosterTabViewModel {
  readonly id: BackofficeRosterTabId;
  readonly label: string;
}

export interface BackofficeRosterDetailViewModel {
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly regularSlotsLabel: string;
  readonly guestLabel: string;
  readonly pendingLabel: string;
  readonly validityLabel: string;
  readonly memberships: readonly string[];
  readonly pendingRequests: readonly string[];
  readonly history: readonly string[];
  readonly restrictions: readonly string[];
  readonly primaryColor: string;
  readonly secondaryColor: string;
}

export const BACKOFFICE_ROSTER_TABS: readonly BackofficeRosterTabViewModel[] = [
  { id: 'memberships', label: 'Activas' },
  { id: 'pending', label: 'Pendientes' },
  { id: 'history', label: 'Histórico' },
  { id: 'rules', label: 'Reglas' },
];

export const DEFAULT_BACKOFFICE_ROSTER_TAB: BackofficeRosterTabId = 'memberships';

export function toBackofficeRosterCardViewModel(
  roster: BackofficeRosterSummary,
): BackofficeRosterCardViewModel {
  return {
    id: roster.id,
    title: roster.teamName,
    subtitle: `${roster.teamShortName} · ${roster.seasonLabel}`,
    statusLabel: toRosterStatusLabel(roster.status),
    statusTone: toRosterStatusTone(roster.status),
    regularSlotsLabel: `${roster.regularSlotsUsed}/${roster.regularSlotsLimit} regulares activos`,
    guestLabel: toGuestLabel(roster.activeGuestCount),
    pendingLabel: toPendingLabel(roster.pendingRequestsCount),
    validityLabel: `Vigencia: ${roster.validityLabel}`,
    detailPath: `/backoffice/plantillas/${roster.id}`,
    primaryColor: roster.primaryColor,
    secondaryColor: roster.secondaryColor,
  };
}

export function toBackofficeRosterDetailViewModel(
  roster: BackofficeRosterDetail,
): BackofficeRosterDetailViewModel {
  return {
    title: roster.teamName,
    subtitle: `${roster.teamShortName} · ${roster.seasonLabel}`,
    statusLabel: toRosterStatusLabel(roster.status),
    statusTone: toRosterStatusTone(roster.status),
    regularSlotsLabel: `${roster.regularSlotsUsed}/${roster.regularSlotsLimit} regulares activos`,
    guestLabel: toGuestLabel(roster.activeGuestCount),
    pendingLabel: toPendingLabel(roster.pendingRequestsCount),
    validityLabel: `Vigencia operativa: ${roster.validityLabel}`,
    memberships: roster.members.map((member) => {
      const typeLabel = toMembershipTypeLabel(member.membershipType);
      const statusLabel = toMembershipStatusLabel(member.status);
      const effectiveToLabel = member.effectiveToLabel ? ` · Hasta ${member.effectiveToLabel}` : '';

      return `${member.playerName} · ${typeLabel} · ${statusLabel} · Desde ${member.effectiveFromLabel}${effectiveToLabel} · ${member.note}`;
    }),
    pendingRequests: roster.pendingRequests.map(
      (request) =>
        `${request.label} · Solicitado por ${request.requestedBy} · ${request.effectiveFromLabel} · ${request.statusLabel}`,
    ),
    history: roster.history.map((entry) => `${entry.label} · ${entry.happenedAtLabel}`),
    restrictions: roster.restrictions.map(
      (restriction) => `${restriction.label}: ${restriction.description}`,
    ),
    primaryColor: roster.primaryColor,
    secondaryColor: roster.secondaryColor,
  };
}

function toRosterStatusLabel(status: BackofficeRosterStatus): string {
  switch (status) {
    case 'HEALTHY':
      return 'Estable';
    case 'REVIEW':
      return 'En revisión';
    case 'CLOSED':
      return 'Cerrada';
  }
}

function toRosterStatusTone(status: BackofficeRosterStatus): StatusBadgeTone {
  switch (status) {
    case 'HEALTHY':
      return 'success';
    case 'REVIEW':
      return 'warning';
    case 'CLOSED':
      return 'neutral';
  }
}

function toMembershipTypeLabel(type: BackofficeRosterMembershipType): string {
  switch (type) {
    case 'REGULAR':
      return 'Regular';
    case 'GUEST':
      return 'Invitado';
  }
}

function toMembershipStatusLabel(status: BackofficeRosterMembershipStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activa';
    case 'ENDED':
      return 'Finalizada';
    case 'REMOVED':
      return 'Eliminada';
  }
}

function toGuestLabel(count: number): string {
  if (count === 0) {
    return 'Sin invitados activos';
  }

  return count === 1 ? '1 invitado activo' : `${count} invitados activos`;
}

function toPendingLabel(count: number): string {
  if (count === 0) {
    return 'Sin solicitudes pendientes';
  }

  return count === 1 ? '1 solicitud pendiente' : `${count} solicitudes pendientes`;
}
