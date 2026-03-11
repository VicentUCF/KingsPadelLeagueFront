import { type InMemoryBackofficeState } from './in-memory-backoffice-data.types';

export const INITIAL_IN_MEMORY_BACKOFFICE_STATE: InMemoryBackofficeState = {
  seasons: [
    {
      id: 'season-2025',
      name: 'Temporada 2025',
      year: 2025,
      status: 'FINISHED',
      startDate: '2025-03-02',
      endDate: '2025-06-29',
      notes: [
        'Operativa cerrada. Solo debería permitirse consulta y archivado.',
        'No se deben reabrir flujos normales desde esta season.',
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
      startDate: '2027-03-01',
      endDate: '2027-06-28',
      notes: [
        'Season editable. Aquí irán altas de equipos, jornadas y fechas base.',
        'Solo se podrá activar cuando no exista otra season activa.',
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
      startDate: '2024-03-03',
      endDate: '2024-06-30',
      notes: [
        'Season archivada. Debe mantenerse como histórico sin cambios operativos.',
        'El detalle sigue siendo visible para consulta y trazabilidad.',
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
      startDate: '2026-03-03',
      endDate: '2026-06-28',
      notes: [
        'Operativa habilitada. Esta season concentra jornadas, fixtures y sanciones en curso.',
        'Debe resaltarse como la única season activa del sistema.',
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
  ],
  teams: [
    {
      id: 'barbaridad',
      name: 'Barbaridad',
      shortName: 'BAR',
      primaryColor: '#B53A1D',
      secondaryColor: '#F2A65A',
      presidentName: 'Romero',
      activeRegularPlayersCount: 6,
      status: 'ACTIVE',
      seasonId: 'season-2026',
      roleAssignments: [
        createRole('Presidente', 'Romero', 'Season activa · 2026'),
        createRole('Delegado', 'Eloy Segura', 'Apoyo operativo en jornada'),
      ],
      rosterMembers: [
        createRosterMember('Ivan Soto', 'Regular activo'),
        createRosterMember('Nico Prieto', 'Regular activo'),
        createRosterMember('Carlos Mora', 'Regular activo'),
      ],
      fixtures: [
        createFixture('Barbaridad vs Kings of Favar', 'Convocatoria pendiente'),
        createFixture('Magic City vs Barbaridad', 'Programado'),
      ],
      sanctions: [createSanction('Retraso en entrega de convocatoria', -1, 'Aplicada')],
      mvpHistory: [createMvp('Jornada 3', 'Carlos Mora', 'Nominado interno')],
    },
    {
      id: 'kings-of-favar',
      name: 'Kings of Favar',
      shortName: 'KOF',
      primaryColor: '#1B1F3B',
      secondaryColor: '#D4AF37',
      presidentName: 'Navarro',
      activeRegularPlayersCount: 6,
      status: 'ACTIVE',
      seasonId: 'season-2026',
      roleAssignments: [
        createRole('Presidente', 'Navarro', 'Season activa · 2026'),
        createRole('Delegado', 'Iker Solis', 'Soporte de alineaciones'),
      ],
      rosterMembers: [
        createRosterMember('Alejandro Mena', 'Regular activo'),
        createRosterMember('Raul Pizarro', 'Regular activo'),
        createRosterMember('Sergio Vela', 'Regular activo'),
      ],
      fixtures: [
        createFixture('Kings of Favar vs Barbaridad', 'Convocatoria pendiente'),
        createFixture('Titanics vs Kings of Favar', 'Cerrado'),
      ],
      sanctions: [],
      mvpHistory: [createMvp('Jornada 2', 'Alejandro Mena', 'Ganador MVP')],
    },
    {
      id: 'titanics',
      name: 'Titanics',
      shortName: 'TIT',
      primaryColor: '#1C355E',
      secondaryColor: '#8FD3FF',
      presidentName: 'Torres',
      activeRegularPlayersCount: 6,
      status: 'ACTIVE',
      seasonId: 'season-2026',
      roleAssignments: [
        createRole('Presidente', 'Torres', 'Season activa · 2026'),
        createRole('Delegado', 'Gonzalo Riera', 'Control de convocatorias'),
      ],
      rosterMembers: [
        createRosterMember('Marco Vidal', 'Regular activo'),
        createRosterMember('Diego Llorens', 'Regular activo'),
        createRosterMember('Hugo Ferrer', 'Regular activo'),
      ],
      fixtures: [
        createFixture('Titanics vs House Perez', 'Resultado pendiente'),
        createFixture('Titanics vs Kings of Favar', 'Cerrado'),
      ],
      sanctions: [createSanction('Corrección administrativa de acta', -2, 'Revertida')],
      mvpHistory: [createMvp('Jornada 1', 'Marco Vidal', 'Nominado interno')],
    },
  ],
  players: [
    {
      id: 'player-alex-soler',
      fullName: 'Alex Soler',
      nickName: 'Alex',
      avatarPath: '/stock_players/player-01.svg',
      status: 'ACTIVE',
      preferredSideLabel: 'Revés',
      linkedUserEmail: 'alex.soler@kings.test',
      currentTeamId: 'kings-of-favar',
      historicalMemberships: [
        createMembership('Kings of Favar', 'Temporada 2026', 'Regular activo'),
        createMembership('Titanics', 'Temporada 2025', 'Regular finalizado'),
      ],
      participations: [
        createParticipation('Jornada 3 · Kings of Favar', 'Participó como pareja uno'),
        createParticipation('Jornada 2 · Kings of Favar', 'Participó como pareja dos'),
      ],
      mvpNominations: [createMvpNomination('Jornada 3 · Kings of Favar', 'Nominado por su equipo')],
    },
    {
      id: 'player-marco-vidal',
      fullName: 'Marco Vidal',
      nickName: 'Marco',
      avatarPath: '/stock_players/player-02.svg',
      status: 'ACTIVE',
      preferredSideLabel: 'Derecha',
      linkedUserEmail: 'marco.vidal@titanics.test',
      currentTeamId: 'titanics',
      historicalMemberships: [createMembership('Titanics', 'Temporada 2026', 'Regular activo')],
      participations: [
        createParticipation('Jornada 3 · Titanics', 'Participó como pareja uno'),
        createParticipation('Jornada 1 · Titanics', 'Participó como pareja uno'),
      ],
      mvpNominations: [createMvpNomination('Jornada 1 · Titanics', 'Nominado interno')],
    },
    {
      id: 'player-ruben-gil',
      fullName: 'Ruben Gil',
      nickName: 'Ruben',
      avatarPath: '/stock_players/player-03.svg',
      status: 'INACTIVE',
      preferredSideLabel: 'Ambas',
      linkedUserEmail: null,
      currentTeamId: null,
      historicalMemberships: [
        createMembership('Magic City', 'Temporada 2025', 'Regular finalizado'),
      ],
      participations: [createParticipation('Jornada 6 · Magic City', 'Participación registrada')],
      mvpNominations: [],
    },
  ],
};

function createRole(roleLabel: string, userName: string, assignmentLabel: string) {
  return {
    roleLabel,
    userName,
    assignmentLabel,
  };
}

function createRosterMember(playerName: string, membershipLabel: string) {
  return {
    playerName,
    membershipLabel,
  };
}

function createFixture(fixtureLabel: string, statusLabel: string) {
  return {
    fixtureLabel,
    statusLabel,
  };
}

function createSanction(reason: string, pointsDelta: number, statusLabel: string) {
  return {
    reason,
    pointsDelta,
    statusLabel,
  };
}

function createMvp(matchdayLabel: string, playerName: string, resultLabel: string) {
  return {
    matchdayLabel,
    playerName,
    resultLabel,
  };
}

function createMembership(teamName: string, seasonLabel: string, membershipLabel: string) {
  return {
    teamName,
    seasonLabel,
    membershipLabel,
  };
}

function createParticipation(label: string, resultLabel: string) {
  return {
    label,
    resultLabel,
  };
}

function createMvpNomination(label: string, statusLabel: string) {
  return {
    label,
    statusLabel,
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
