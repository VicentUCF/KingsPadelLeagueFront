import { type BackofficePlayerDetail } from '@features/backoffice/domain/entities/backoffice-player.entity';

export const IN_MEMORY_BACKOFFICE_PLAYERS: readonly BackofficePlayerDetail[] = [
  {
    id: 'player-alex-soler',
    fullName: 'Alex Soler',
    nickName: 'Alex',
    avatarPath: '/stock_players/player-01.svg',
    status: 'ACTIVE',
    derivedCurrentTeamName: 'Kings of Favar',
    historicalTeamNames: ['Kings of Favar', 'Titanics'],
    isUserLinked: true,
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
    derivedCurrentTeamName: 'Titanics',
    historicalTeamNames: ['Titanics'],
    isUserLinked: true,
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
    derivedCurrentTeamName: null,
    historicalTeamNames: ['Magic City'],
    isUserLinked: false,
    preferredSideLabel: 'Ambas',
    linkedUserEmail: null,
    currentTeamId: null,
    historicalMemberships: [createMembership('Magic City', 'Temporada 2025', 'Regular finalizado')],
    participations: [createParticipation('Jornada 6 · Magic City', 'Participación registrada')],
    mvpNominations: [],
  },
] as const;

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
