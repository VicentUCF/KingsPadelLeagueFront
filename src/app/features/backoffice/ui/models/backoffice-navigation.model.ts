import {
  CalendarClock,
  ClipboardList,
  Files,
  FolderKanban,
  LayoutDashboard,
  ScrollText,
  ShieldUser,
  Trophy,
  UserCog,
  UsersRound,
  type LucideIconData,
} from 'lucide-angular';

import { type BackofficeRole } from '../../domain/entities/backoffice-role';

export const BACKOFFICE_ROOT_PATH = '/backoffice';

export const BACKOFFICE_ROUTE_SEGMENTS = {
  seasons: 'temporadas',
  teams: 'equipos',
  players: 'jugadores',
  roster: 'plantillas',
  matchdays: 'jornadas',
  fixtures: 'fixtures',
  mvp: 'mvp',
  users: 'usuarios',
  audit: 'auditoria',
} as const;

export interface BackofficeNavigationItem {
  readonly label: string;
  readonly segment: string;
  readonly path: string;
  readonly icon: LucideIconData;
  readonly allowedRoles: readonly BackofficeRole[];
  readonly isImplemented: boolean;
}

const ALL_ROLES = ['ADMIN', 'PRESIDENT', 'USER'] as const satisfies readonly BackofficeRole[];
const ADMIN_AND_PRESIDENT = ['ADMIN', 'PRESIDENT'] as const satisfies readonly BackofficeRole[];
const ADMIN_ONLY = ['ADMIN'] as const satisfies readonly BackofficeRole[];

export const BACKOFFICE_NAVIGATION: readonly BackofficeNavigationItem[] = [
  {
    label: 'Dashboard',
    segment: '',
    path: BACKOFFICE_ROOT_PATH,
    icon: LayoutDashboard,
    allowedRoles: ALL_ROLES,
    isImplemented: true,
  },
  {
    label: 'Temporadas',
    segment: BACKOFFICE_ROUTE_SEGMENTS.seasons,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.seasons}`,
    icon: FolderKanban,
    allowedRoles: ADMIN_ONLY,
    isImplemented: true,
  },
  {
    label: 'Equipos',
    segment: BACKOFFICE_ROUTE_SEGMENTS.teams,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.teams}`,
    icon: ShieldUser,
    allowedRoles: ADMIN_AND_PRESIDENT,
    isImplemented: true,
  },
  {
    label: 'Jugadores',
    segment: BACKOFFICE_ROUTE_SEGMENTS.players,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.players}`,
    icon: UsersRound,
    allowedRoles: ADMIN_AND_PRESIDENT,
    isImplemented: true,
  },
  {
    label: 'Plantillas',
    segment: BACKOFFICE_ROUTE_SEGMENTS.roster,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.roster}`,
    icon: ClipboardList,
    allowedRoles: ADMIN_AND_PRESIDENT,
    isImplemented: true,
  },
  {
    label: 'Jornadas',
    segment: BACKOFFICE_ROUTE_SEGMENTS.matchdays,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.matchdays}`,
    icon: CalendarClock,
    allowedRoles: ADMIN_ONLY,
    isImplemented: false,
  },
  {
    label: 'Fixtures',
    segment: BACKOFFICE_ROUTE_SEGMENTS.fixtures,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.fixtures}`,
    icon: Files,
    allowedRoles: ADMIN_AND_PRESIDENT,
    isImplemented: false,
  },
  {
    label: 'MVP',
    segment: BACKOFFICE_ROUTE_SEGMENTS.mvp,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.mvp}`,
    icon: Trophy,
    allowedRoles: ALL_ROLES,
    isImplemented: false,
  },
  {
    label: 'Usuarios',
    segment: BACKOFFICE_ROUTE_SEGMENTS.users,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.users}`,
    icon: UserCog,
    allowedRoles: ADMIN_ONLY,
    isImplemented: false,
  },
  {
    label: 'Auditoría',
    segment: BACKOFFICE_ROUTE_SEGMENTS.audit,
    path: `${BACKOFFICE_ROOT_PATH}/${BACKOFFICE_ROUTE_SEGMENTS.audit}`,
    icon: ScrollText,
    allowedRoles: ADMIN_ONLY,
    isImplemented: false,
  },
];
