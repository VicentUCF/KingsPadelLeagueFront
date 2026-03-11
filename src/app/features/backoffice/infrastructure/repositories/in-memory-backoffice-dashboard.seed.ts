import { type BackofficeDashboardSnapshot } from '@features/backoffice/domain/entities/backoffice-dashboard-snapshot.entity';

export const IN_MEMORY_BACKOFFICE_DASHBOARD_SNAPSHOT: BackofficeDashboardSnapshot = {
  activeSeason: {
    id: 'season-2026',
    label: 'Temporada 2026',
    status: 'ACTIVE',
    teamCount: 5,
    matchdayCount: 7,
    scheduleLabel: '3 mar · 28 jun',
  },
  nextMatchday: {
    id: 'matchday-4',
    label: 'Jornada 4 · Regular',
    status: 'OPEN',
    scheduledDateLabel: 'Domingo 22 marzo · 17:00',
    lineupDeadlineLabel: 'Viernes 20 marzo · 22:00',
    pendingFixturesCount: 2,
  },
  pendingLineupsCount: 3,
  pendingRosterRequestsCount: 2,
  pendingGuestRequestsCount: 1,
  pendingResultsCount: 2,
  recentSanctions: [
    {
      id: 'sanction-1',
      teamName: 'Titanics',
      type: 'LATE_LINEUP',
      reason: 'Entrega tardía de convocatoria',
      pointsDelta: -1,
      appliedAtLabel: 'Hace 2 horas',
      status: 'APPLIED',
    },
    {
      id: 'sanction-2',
      teamName: 'House Perez',
      type: 'ADMIN_DECISION',
      reason: 'Ajuste manual tras revisión de acta',
      pointsDelta: -2,
      appliedAtLabel: 'Hace 1 día',
      status: 'REVERTED',
    },
  ],
  currentMvpElection: {
    matchdayLabel: 'Jornada 4',
    status: 'INTERNAL_VOTING_OPEN',
    nominationsCount: 4,
    internalVotesCount: 2,
    publicVotesCount: 0,
  },
};
