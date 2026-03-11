import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonStandingEntry,
  type BackofficeSeasonSummary,
} from '../../domain/entities/backoffice-season.entity';
import { type BackofficeSeasonStatus } from '../../domain/entities/backoffice-season-status';
import { type StatusBadgeTone } from './status-badge-tone';

export interface BackofficeSeasonCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly restrictionLabel: string;
  readonly detailPath: string;
  readonly actionsLabel: string;
}

export interface BackofficeSeasonDetailViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly operationalStateLabel: string;
  readonly notes: readonly string[];
  readonly actions: readonly string[];
  readonly teams: readonly string[];
  readonly matchdays: readonly string[];
  readonly standings: readonly BackofficeSeasonStandingEntry[];
}

export function toBackofficeSeasonCardViewModel(
  season: BackofficeSeasonSummary,
): BackofficeSeasonCardViewModel {
  return {
    id: season.id,
    title: season.name,
    subtitle: `${season.scheduleLabel} · ${season.teamCount} equipos · ${season.matchdayCount} jornadas`,
    statusLabel: toSeasonStatusLabel(season.status),
    statusTone: toSeasonStatusTone(season.status),
    restrictionLabel: toSeasonRestrictionLabel(season.status),
    detailPath: `/backoffice/temporadas/${season.id}`,
    actionsLabel: toSeasonActionLabel(season.status),
  };
}

export function toBackofficeSeasonDetailViewModel(
  season: BackofficeSeasonDetail,
): BackofficeSeasonDetailViewModel {
  return {
    id: season.id,
    title: season.name,
    subtitle: `${season.year} · ${season.scheduleLabel}`,
    statusLabel: toSeasonStatusLabel(season.status),
    statusTone: toSeasonStatusTone(season.status),
    operationalStateLabel: toOperationalStateLabel(season.status),
    notes: season.notes,
    actions: toSeasonActions(season.status),
    teams: season.teams.map((team) => `${team.name} · ${team.shortName}`),
    matchdays: season.matchdays.map(
      (matchday) => `${matchday.label} · ${matchday.scheduledDateLabel} · ${matchday.statusLabel}`,
    ),
    standings: season.standings,
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

function toSeasonRestrictionLabel(status: BackofficeSeasonStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Única season activa';
    case 'DRAFT':
      return 'Editable antes de activar';
    case 'FINISHED':
      return 'Operativa restringida';
    case 'ARCHIVED':
      return 'Solo lectura histórica';
  }
}

function toSeasonActionLabel(status: BackofficeSeasonStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Permite cierre, seguimiento y control operativo.';
    case 'DRAFT':
      return 'Permite edición y futura activación.';
    case 'FINISHED':
      return 'Permite revisión final y archivado.';
    case 'ARCHIVED':
      return 'Disponible solo para consulta.';
  }
}

function toOperationalStateLabel(status: BackofficeSeasonStatus): string {
  switch (status) {
    case 'ACTIVE':
      return 'Operativa habilitada';
    case 'DRAFT':
      return 'Configuración en borrador';
    case 'FINISHED':
      return 'Operativa cerrada';
    case 'ARCHIVED':
      return 'Histórico bloqueado';
  }
}

function toSeasonActions(status: BackofficeSeasonStatus): readonly string[] {
  switch (status) {
    case 'ACTIVE':
      return ['Finalizar season', 'Archivar season'];
    case 'DRAFT':
      return ['Editar season', 'Activar season'];
    case 'FINISHED':
      return ['Archivar season'];
    case 'ARCHIVED':
      return ['Sin acciones operativas'];
  }
}
