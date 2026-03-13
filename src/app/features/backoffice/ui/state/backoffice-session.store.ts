import { computed, Injectable, signal } from '@angular/core';
import {
  CalendarRange,
  ClipboardList,
  History,
  LayoutDashboard,
  Shield,
  Swords,
  Trophy,
  UserCog,
  Users,
} from 'lucide-angular';

import type { BackofficeRole } from '@features/backoffice/domain/entities/backoffice-role';
import {
  BACKOFFICE_ROOT_PATH,
  type BackofficeNavigationItem,
} from '../models/backoffice-navigation.model';

@Injectable()
export class BackofficeSessionStore {
  readonly currentRole = signal<BackofficeRole>('ADMIN');
  readonly availableRoles: readonly BackofficeRole[] = ['ADMIN', 'PRESIDENT'];

  readonly navigation = computed(() => this.buildNavigation(this.currentRole()));

  updateRoleFromValue(value: string): void {
    if (value === 'ADMIN' || value === 'PRESIDENT') {
      this.currentRole.set(value);
    }
  }

  private buildNavigation(role: BackofficeRole): readonly BackofficeNavigationItem[] {
    const isAdmin = role === 'ADMIN';

    return [
      {
        path: BACKOFFICE_ROOT_PATH,
        label: 'Dashboard',
        icon: LayoutDashboard,
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/temporadas`,
        label: 'Temporadas',
        icon: CalendarRange,
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/equipos`,
        label: 'Equipos',
        icon: Shield,
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/jugadores`,
        label: 'Jugadores',
        icon: Users,
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/jornadas`,
        label: 'Jornadas',
        icon: Swords,
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/clasificacion`,
        label: 'Clasificación',
        icon: Trophy,
        isAccessible: !isAdmin,
        isImplemented: false,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/alineaciones`,
        label: 'Alineaciones',
        icon: ClipboardList,
        isAccessible: true,
        isImplemented: false,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/usuarios`,
        label: 'Usuarios',
        icon: UserCog,
        isAccessible: isAdmin,
        isImplemented: false,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/auditoria`,
        label: 'Auditoría',
        icon: History,
        isAccessible: isAdmin,
        isImplemented: false,
      },
    ];
  }
}
