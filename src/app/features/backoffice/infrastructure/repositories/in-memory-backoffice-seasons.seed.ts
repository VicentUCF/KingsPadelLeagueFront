import { type BackofficeSeasonDetail } from '@features/backoffice/domain/entities/backoffice-season.entity';

export const IN_MEMORY_BACKOFFICE_SEASONS: readonly BackofficeSeasonDetail[] = [
  {
    id: 'season-2025',
    name: 'Temporada 2025',
    year: 2025,
    status: 'FINISHED',
    scheduleLabel: '2 marzo · 29 junio',
    teamCount: 5,
    matchdayCount: 7,
    notes: [
      'Operativa cerrada. Solo debería permitirse consulta y archivado.',
      'No se deben reabrir flujos normales desde esta season.',
    ],
    teams: [
      createTeam('kings-of-favar', 'Kings of Favar', 'KOF'),
      createTeam('titanics', 'Titanics', 'TIT'),
      createTeam('barbaridad', 'Barbaridad', 'BAR'),
    ],
    matchdays: [
      createMatchday('2025-m7', 'Jornada 7', '29 junio', 'Cerrada'),
      createMatchday('2025-m6', 'Jornada 6', '22 junio', 'Cerrada'),
    ],
    standings: [
      createStanding(1, 'Kings of Favar', 18, 7, 14),
      createStanding(2, 'Titanics', 16, 7, 11),
      createStanding(3, 'Barbaridad', 10, 7, 3),
    ],
  },
  {
    id: 'season-2027',
    name: 'Temporada 2027',
    year: 2027,
    status: 'DRAFT',
    scheduleLabel: '1 marzo · 28 junio',
    teamCount: 6,
    matchdayCount: 8,
    notes: [
      'Season editable. Aquí irán altas de equipos, jornadas y fechas base.',
      'Solo se podrá activar cuando no exista otra season activa.',
    ],
    teams: [
      createTeam('kings-of-favar', 'Kings of Favar', 'KOF'),
      createTeam('titanics', 'Titanics', 'TIT'),
      createTeam('magic-city', 'Magic City', 'MGC'),
    ],
    matchdays: [
      createMatchday('2027-m1', 'Jornada 1', '8 marzo', 'Borrador'),
      createMatchday('2027-m2', 'Jornada 2', '15 marzo', 'Borrador'),
    ],
    standings: [],
  },
  {
    id: 'season-2024',
    name: 'Temporada 2024',
    year: 2024,
    status: 'ARCHIVED',
    scheduleLabel: '3 marzo · 30 junio',
    teamCount: 4,
    matchdayCount: 6,
    notes: [
      'Season archivada. Debe mantenerse como histórico sin cambios operativos.',
      'El detalle sigue siendo visible para consulta y trazabilidad.',
    ],
    teams: [
      createTeam('house-perez', 'House Perez', 'HOP'),
      createTeam('titanics', 'Titanics', 'TIT'),
    ],
    matchdays: [
      createMatchday('2024-m6', 'Jornada 6', '30 junio', 'Archivada'),
      createMatchday('2024-m5', 'Jornada 5', '23 junio', 'Archivada'),
    ],
    standings: [
      createStanding(1, 'Titanics', 15, 6, 12),
      createStanding(2, 'House Perez', 9, 6, -1),
    ],
  },
  {
    id: 'season-2026',
    name: 'Temporada 2026',
    year: 2026,
    status: 'ACTIVE',
    scheduleLabel: '3 marzo · 28 junio',
    teamCount: 5,
    matchdayCount: 7,
    notes: [
      'Operativa habilitada. Esta season concentra jornadas, fixtures y sanciones en curso.',
      'Debe resaltarse como la única season activa del sistema.',
    ],
    teams: [
      createTeam('kings-of-favar', 'Kings of Favar', 'KOF'),
      createTeam('titanics', 'Titanics', 'TIT'),
      createTeam('barbaridad', 'Barbaridad', 'BAR'),
      createTeam('magic-city', 'Magic City', 'MGC'),
      createTeam('house-perez', 'House Perez', 'HOP'),
    ],
    matchdays: [
      createMatchday('2026-m4', 'Jornada 4', '22 marzo', 'Abierta'),
      createMatchday('2026-m5', 'Jornada 5', '29 marzo', 'Programada'),
      createMatchday('2026-m6', 'Jornada 6', '5 abril', 'Programada'),
    ],
    standings: [
      createStanding(1, 'Titanics', 11, 3, 8),
      createStanding(2, 'Kings of Favar', 10, 3, 6),
      createStanding(3, 'Barbaridad', 7, 3, 1),
      createStanding(4, 'Magic City', 5, 3, -4),
      createStanding(5, 'House Perez', 2, 3, -11),
    ],
  },
] as const;

function createTeam(id: string, name: string, shortName: string) {
  return {
    id,
    name,
    shortName,
  };
}

function createMatchday(
  id: string,
  label: string,
  scheduledDateLabel: string,
  statusLabel: string,
) {
  return {
    id,
    label,
    scheduledDateLabel,
    statusLabel,
  };
}

function createStanding(
  rank: number,
  teamName: string,
  points: number,
  playedMatches: number,
  gameDifference: number,
) {
  return {
    rank,
    teamName,
    points,
    playedMatches,
    gameDifference,
  };
}
