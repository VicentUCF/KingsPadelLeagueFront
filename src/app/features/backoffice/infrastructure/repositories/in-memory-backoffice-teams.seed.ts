import { type BackofficeTeamDetail } from '@features/backoffice/domain/entities/backoffice-team.entity';

export const IN_MEMORY_BACKOFFICE_TEAMS: readonly BackofficeTeamDetail[] = [
  {
    id: 'barbaridad',
    name: 'Barbaridad Team',
    shortName: 'BAR',
    primaryColor: '#b53a1d',
    secondaryColor: '#f2a65a',
    presidentName: 'Samu',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Color principal naranja quemado con acento cobre.',
    roleAssignments: [createRole('Presidente', 'Samu', 'Season activa · 2026')],
    rosterMembers: [
      createRosterMember('Alex Pla', 'Regular activo'),
      createRosterMember('Andreu Simo', 'Regular activo'),
      createRosterMember('Gabi', 'Regular activo'),
      createRosterMember('Javi Moya', 'Regular activo'),
      createRosterMember('Alejandro', 'Regular activo'),
    ],
    fixtures: [
      createFixture('Barbaridad vs Kings of Favar', 'Convocatoria pendiente'),
      createFixture('Magic City vs Barbaridad', 'Programado'),
    ],
    sanctions: [],
    mvpHistory: [],
  },
  {
    id: 'kings-of-favar',
    name: 'Kings Of Favar',
    shortName: 'KOF',
    primaryColor: '#1b1f3b',
    secondaryColor: '#d4af37',
    presidentName: 'Vicent Ciscar',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Base azul noche con acento dorado de identidad principal.',
    roleAssignments: [
      createRole('Presidente', 'Vicent Ciscar', 'Season activa · 2026'),
      createRole('Presidente', 'Enric Bixquert', 'Season activa · 2026'),
    ],
    rosterMembers: [
      createRosterMember('Raul Bataller', 'Regular activo'),
      createRosterMember('Tono', 'Regular activo'),
      createRosterMember('Jose Sanfelix', 'Regular activo'),
      createRosterMember('Damian Crespo', 'Regular activo'),
    ],
    fixtures: [
      createFixture('Kings of Favar vs Barbaridad', 'Convocatoria pendiente'),
      createFixture('Titanics vs Kings of Favar', 'Programado'),
    ],
    sanctions: [],
    mvpHistory: [],
  },
  {
    id: 'titanics',
    name: 'Titanics',
    shortName: 'TIT',
    primaryColor: '#1c355e',
    secondaryColor: '#8fd3ff',
    presidentName: 'Adrian Asuncion',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Paleta fría con azul profundo y acento hielo.',
    roleAssignments: [createRole('Presidente', 'Adrian Asuncion', 'Season activa · 2026')],
    rosterMembers: [
      createRosterMember('Javi Millet', 'Regular activo'),
      createRosterMember('Carles Montilla', 'Regular activo'),
      createRosterMember('Brigante', 'Regular activo'),
      createRosterMember('Joan Meló', 'Regular activo'),
      createRosterMember('Tomas', 'Regular activo'),
    ],
    fixtures: [
      createFixture('Titanics vs Thormentadores', 'Programado'),
      createFixture('Titanics vs Kings of Favar', 'Programado'),
    ],
    sanctions: [],
    mvpHistory: [],
  },
  {
    id: 'thormentadores',
    name: 'Thormentadores',
    shortName: 'THO',
    primaryColor: '#1a3a1a',
    secondaryColor: '#4caf50',
    presidentName: 'Borja Vercher',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Verde oscuro con acento verde brillante.',
    roleAssignments: [createRole('Presidente', 'Borja Vercher', 'Season activa · 2026')],
    rosterMembers: [
      createRosterMember('Miguel Esteve', 'Regular activo'),
      createRosterMember('Dani Manzano', 'Regular activo'),
      createRosterMember('David Gregori', 'Regular activo'),
      createRosterMember('Jordi Vitoria', 'Regular activo'),
      createRosterMember('Marc Ripoll', 'Regular activo'),
    ],
    fixtures: [
      createFixture('Thormentadores vs Magic City', 'Programado'),
      createFixture('Titanics vs Thormentadores', 'Programado'),
    ],
    sanctions: [],
    mvpHistory: [],
  },
  {
    id: 'magic-city',
    name: 'Magic City',
    shortName: 'MAG',
    primaryColor: '#2d0066',
    secondaryColor: '#cc00ff',
    presidentName: 'Adri Alvarez',
    activeRegularPlayersCount: 6,
    status: 'ACTIVE',
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Morado oscuro con acento fucsia.',
    roleAssignments: [createRole('Presidente', 'Adri Alvarez', 'Season activa · 2026')],
    rosterMembers: [
      createRosterMember('Ruben Marzal', 'Regular activo'),
      createRosterMember('Dani Sanchez', 'Regular activo'),
      createRosterMember('Josep Castello', 'Regular activo'),
      createRosterMember('Emilio Esteve', 'Regular activo'),
      createRosterMember('Artur Peris', 'Regular activo'),
    ],
    fixtures: [
      createFixture('Magic City vs Barbaridad', 'Programado'),
      createFixture('Thormentadores vs Magic City', 'Programado'),
    ],
    sanctions: [],
    mvpHistory: [],
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

// function createSanction(reason: string, pointsDelta: number, statusLabel: string) {
//   return {
//     reason,
//     pointsDelta,
//     statusLabel,
//   };
// }

// function createMvp(matchdayLabel: string, playerName: string, resultLabel: string) {
//   return {
//     matchdayLabel,
//     playerName,
//     resultLabel,
//   };
// }
