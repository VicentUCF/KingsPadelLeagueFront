import { computed, inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LayoutDashboard, Shield, Swords, Trophy, UserCog, Users } from 'lucide-angular';

import { hasBackofficeUiAdminOverride } from '@core/auth/backoffice-ui-admin-override';
import type { AuthRole } from '@features/auth/domain/entities/auth-user';
import { AuthStore } from '@features/auth/ui/state/auth.store';
import type { BackofficeRole } from '@features/backoffice/domain/entities/backoffice-role';
import { BackofficePlayersStore } from './backoffice-players.store';
import {
  BACKOFFICE_ROOT_PATH,
  type BackofficeNavigationItem,
} from '../models/backoffice-navigation.model';

@Injectable()
export class BackofficeSessionStore {
  private readonly authStore = inject(AuthStore);
  private readonly playersStore = inject(BackofficePlayersStore);
  private readonly router = inject(Router);

  readonly currentRole = computed<BackofficeRole>(() => {
    const role = this.authStore.currentRole();
    return toBackofficeRole(role);
  });

  readonly currentUser = this.authStore.user;

  readonly currentPresidentTeamId = computed(() => {
    const user = this.authStore.user();
    if (!user) {
      return null;
    }

    if (user.teamId) {
      return user.teamId;
    }

    const normalizedEmail = normalizeEmail(user.email);
    if (!normalizedEmail) {
      return null;
    }

    return (
      this.playersStore.players().find((player) => normalizeEmail(player.email) === normalizedEmail)
        ?.teamId ?? null
    );
  });

  readonly navigation = computed(() => this.buildNavigation(this.currentRole()));

  async logout(): Promise<void> {
    await this.authStore.logout();
    await this.router.navigate(['/auth/login']);
  }

  private buildNavigation(role: BackofficeRole): readonly BackofficeNavigationItem[] {
    const isAdmin = role === 'ADMIN';

    return [
      {
        path: BACKOFFICE_ROOT_PATH,
        label: isAdmin ? 'Dashboard' : 'Mi equipo',
        icon: LayoutDashboard,
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
        isAccessible: true,
        isImplemented: true,
      },
      {
        path: `${BACKOFFICE_ROOT_PATH}/usuarios`,
        label: 'Usuarios',
        icon: UserCog,
        isAccessible: isAdmin,
        isImplemented: true,
      },
    ];
  }
}

function toBackofficeRole(role: AuthRole | null): BackofficeRole {
  if (hasBackofficeUiAdminOverride(role)) {
    return 'ADMIN';
  }

  if (role === 'ADMIN' || role === 'PRESIDENT' || role === 'PLAYER') {
    return role;
  }

  return 'PLAYER';
}

function normalizeEmail(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? '';
}
