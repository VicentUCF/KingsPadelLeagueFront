import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

export const IN_MEMORY_BACKOFFICE_TEAMS: readonly BackofficeTeamDetail[] = [
  {
    id: 'barbaridad',
    name: 'Barbaridad',
    shortName: 'BAR',
    primaryColor: '#b53a1d',
    secondaryColor: '#f2a65a',
    presidentName: 'Romero',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Color principal naranja quemado con acento cobre.',
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
    primaryColor: '#1b1f3b',
    secondaryColor: '#d4af37',
    presidentName: 'Navarro',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Base azul noche con acento dorado de identidad principal.',
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
    primaryColor: '#1c355e',
    secondaryColor: '#8fd3ff',
    presidentName: 'Torres',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Paleta fría con azul profundo y acento hielo.',
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
] as const;

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
