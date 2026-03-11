import {
  type BackofficeDashboardSnapshot,
  type BackofficeMatchdayStatus,
  type BackofficeMvpElectionStatus,
  type BackofficeRecentSanction,
  type BackofficeSanctionStatus,
} from '../../domain/entities/backoffice-dashboard-snapshot.entity';
import { type BackofficeRole } from '../../domain/entities/backoffice-role';
import { type BackofficeSeasonStatus } from '../../domain/entities/backoffice-season-status';
import { BACKOFFICE_ROOT_PATH, BACKOFFICE_ROUTE_SEGMENTS } from './backoffice-navigation.model';
import { type StatusBadgeTone } from './status-badge-tone';

export interface BackofficeSummaryCardViewModel {
  readonly title: string;
  readonly meta: string;
  readonly detail: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
}

export interface BackofficeRequestItemViewModel {
  readonly label: string;
  readonly valueLabel: string;
  readonly description: string;
}

export interface BackofficeQuickActionViewModel {
  readonly label: string;
  readonly description: string;
  readonly path: string;
}

export interface BackofficeRecentSanctionViewModel {
  readonly teamName: string;
  readonly reason: string;
  readonly pointsLabel: string;
  readonly appliedAtLabel: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
}

export interface BackofficeMvpSummaryViewModel {
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly detail: string;
  readonly metrics: readonly string[];
}

export interface BackofficeDashboardViewModel {
  readonly activeSeason: BackofficeSummaryCardViewModel;
  readonly nextMatchday: BackofficeSummaryCardViewModel;
  readonly pendingLineupsLabel: string;
  readonly pendingResultsLabel: string;
  readonly requestItems: readonly BackofficeRequestItemViewModel[];
  readonly recentSanctions: readonly BackofficeRecentSanctionViewModel[];
  readonly mvpSummary: BackofficeMvpSummaryViewModel;
  readonly quickActions: readonly BackofficeQuickActionViewModel[];
}

export function toBackofficeDashboardViewModel(
  snapshot: BackofficeDashboardSnapshot,
  role: BackofficeRole,
): BackofficeDashboardViewModel {
  return {
    activeSeason: {
      title: snapshot.activeSeason.label,
      meta: `${snapshot.activeSeason.teamCount} equipos · ${snapshot.activeSeason.matchdayCount} jornadas`,
      detail: `Ventana operativa: ${snapshot.activeSeason.scheduleLabel}`,
      statusLabel: toSeasonStatusLabel(snapshot.activeSeason.status),
      statusTone: toSeasonStatusTone(snapshot.activeSeason.status),
    },
    nextMatchday: {
      title: snapshot.nextMatchday.label,
      meta: snapshot.nextMatchday.scheduledDateLabel,
      detail: `Deadline convocatoria: ${snapshot.nextMatchday.lineupDeadlineLabel}`,
      statusLabel: toMatchdayStatusLabel(snapshot.nextMatchday.status),
      statusTone: toMatchdayStatusTone(snapshot.nextMatchday.status),
    },
    pendingLineupsLabel: `${snapshot.pendingLineupsCount} convocatorias pendientes`,
    pendingResultsLabel: `${snapshot.pendingResultsCount} resultados pendientes`,
    requestItems: [
      {
        label: 'Cambios de plantilla',
        valueLabel: `${snapshot.pendingRosterRequestsCount} cambios de plantilla`,
        description: 'Solicitudes pendientes de decisión administrativa.',
      },
      {
        label: 'Invitados',
        valueLabel: `${snapshot.pendingGuestRequestsCount} invitado pendiente`,
        description: 'Invitados por revisar para la próxima jornada.',
      },
    ],
    recentSanctions: snapshot.recentSanctions.map(toRecentSanctionViewModel),
    mvpSummary: {
      statusLabel: toMvpStatusLabel(snapshot.currentMvpElection.status),
      statusTone: toMvpStatusTone(snapshot.currentMvpElection.status),
      detail: `${snapshot.currentMvpElection.matchdayLabel} · ${snapshot.currentMvpElection.nominationsCount} nominaciones`,
      metrics: [
        `${snapshot.currentMvpElection.internalVotesCount} votos internos`,
        `${snapshot.currentMvpElection.publicVotesCount} votos públicos`,
      ],
    },
    quickActions: resolveQuickActions(role),
  };
}

function toSeasonStatusLabel(status: BackofficeSeasonStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Activa';
    case 'DRAFT':
      return 'Borrador';
    case 'FINISHED':
      return 'Finalizada';
    case 'ARCHIVED':
      return 'Archivada';
  }
}

function toSeasonStatusTone(status: BackofficeSeasonStatus): StatusBadgeTone {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'DRAFT':
      return 'warning';
    case 'FINISHED':
      return 'brand';
    case 'ARCHIVED':
      return 'neutral';
  }
}

function toMatchdayStatusLabel(status: BackofficeMatchdayStatus): string {
  switch (status) {
    case 'OPEN':
      return 'Abierta';
    case 'IN_PROGRESS':
      return 'En curso';
    case 'CLOSED':
      return 'Cerrada';
    case 'DRAFT':
      return 'Borrador';
  }
}

function toMatchdayStatusTone(status: BackofficeMatchdayStatus): StatusBadgeTone {
  switch (status) {
    case 'OPEN':
      return 'success';
    case 'IN_PROGRESS':
      return 'brand';
    case 'CLOSED':
      return 'neutral';
    case 'DRAFT':
      return 'warning';
  }
}

function toRecentSanctionViewModel(
  sanction: BackofficeRecentSanction,
): BackofficeRecentSanctionViewModel {
  return {
    teamName: sanction.teamName,
    reason: sanction.reason,
    pointsLabel: `${sanction.pointsDelta} pts`,
    appliedAtLabel: sanction.appliedAtLabel,
    statusLabel: toSanctionStatusLabel(sanction.status),
    statusTone: toSanctionStatusTone(sanction.status),
  };
}

function toSanctionStatusLabel(status: BackofficeSanctionStatus): string {
  switch (status) {
    case 'APPLIED':
      return 'Aplicada';
    case 'REVERTED':
      return 'Revertida';
  }
}

function toSanctionStatusTone(status: BackofficeSanctionStatus): StatusBadgeTone {
  switch (status) {
    case 'APPLIED':
      return 'danger';
    case 'REVERTED':
      return 'neutral';
  }
}

function toMvpStatusLabel(status: BackofficeMvpElectionStatus): string {
  switch (status) {
    case 'DRAFT':
      return 'Borrador';
    case 'NOMINATIONS_OPEN':
      return 'Nominaciones abiertas';
    case 'INTERNAL_VOTING_OPEN':
      return 'Votación interna abierta';
    case 'PUBLIC_VOTING_OPEN':
      return 'Votación pública abierta';
    case 'CLOSED':
      return 'Cerrado';
  }
}

function toMvpStatusTone(status: BackofficeMvpElectionStatus): StatusBadgeTone {
  switch (status) {
    case 'DRAFT':
      return 'warning';
    case 'NOMINATIONS_OPEN':
      return 'brand';
    case 'INTERNAL_VOTING_OPEN':
      return 'success';
    case 'PUBLIC_VOTING_OPEN':
      return 'brand';
    case 'CLOSED':
      return 'neutral';
  }
}

function resolveQuickActions(role: BackofficeRole): readonly BackofficeQuickActionViewModel[] {
  switch (role) {
    case 'ADMIN':
      return [
        {
          label: 'Gestionar temporadas',
          description: 'Ir al módulo de temporadas y estados operativos.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.seasons}`,
        },
        {
          label: 'Revisar plantillas',
          description: 'Abrir solicitudes de cambios y altas de invitados.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.roster}`,
        },
        {
          label: 'Ir a fixtures',
          description: 'Entrar al centro operativo de jornadas y cierres.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.fixtures}`,
        },
        {
          label: 'Estado MVP',
          description: 'Revisar nominaciones, votos y estado actual.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.mvp}`,
        },
      ];
    case 'PRESIDENT':
      return [
        {
          label: 'Mi equipo',
          description: 'Consultar la estructura del equipo y próximas acciones.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.teams}`,
        },
        {
          label: 'Gestionar plantillas',
          description: 'Preparar altas, bajas y solicitudes de invitados.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.roster}`,
        },
        {
          label: 'Ir a fixtures',
          description: 'Ver el estado del siguiente cruce y sus bloqueos temporales.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.fixtures}`,
        },
        {
          label: 'Estado MVP',
          description: 'Seguir la jornada activa y sus ventanas de votación.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.mvp}`,
        },
      ];
    case 'USER':
      return [
        {
          label: 'Estado MVP',
          description: 'Ver el estado de la elección y su ventana activa.',
          path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.mvp}`,
        },
      ];
  }
}
