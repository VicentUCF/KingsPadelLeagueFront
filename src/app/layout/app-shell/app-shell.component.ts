import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  House,
  LayoutDashboard,
  LogIn,
  LogOut,
  LucideAngularModule,
  Menu,
  Shield,
  Swords,
  Trophy,
  Users,
  type LucideIconData,
  X,
} from 'lucide-angular';

import { hasBackofficeUiAdminOverride } from '@core/auth/backoffice-ui-admin-override';
import { applicationMetadata } from '@core/config/application-metadata';
import { AuthStore } from '@features/auth/ui/state/auth.store';

export interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIconData;
  readonly matchOptions: { readonly exact: boolean };
}

export interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly items: readonly NavigationItem[];
}

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-shell',
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  private readonly elementRef = inject(ElementRef);
  private readonly router = inject(Router);

  protected readonly authStore = inject(AuthStore);
  protected readonly applicationMetadata = applicationMetadata;

  protected readonly menuIcon = Menu;
  protected readonly closeIcon = X;
  protected readonly arrowRightIcon = ArrowRight;
  protected readonly logInIcon = LogIn;
  protected readonly logOutIcon = LogOut;
  protected readonly chevronDownIcon = ChevronDown;
  protected readonly dashboardIcon = LayoutDashboard;

  protected readonly isNavigationOpen = signal(false);
  protected readonly isUserMenuOpen = signal(false);
  protected readonly openDropdown = signal<string | null>(null);

  protected readonly homeLink: NavigationItem = {
    label: 'Home',
    path: '/',
    icon: House,
    matchOptions: { exact: true },
  };

  protected readonly navGroups: readonly NavGroup[] = [
    {
      id: 'competicion',
      label: 'Competición',
      items: [
        {
          label: 'Clasificación',
          path: '/clasificacion',
          icon: Trophy,
          matchOptions: { exact: true },
        },
        { label: 'Jornadas', path: '/jornadas', icon: Swords, matchOptions: { exact: true } },
      ],
    },
    {
      id: 'club',
      label: 'Club',
      items: [
        { label: 'Jugadores', path: '/jugadores', icon: Users, matchOptions: { exact: false } },
        { label: 'Equipos', path: '/equipos', icon: Shield, matchOptions: { exact: false } },
        {
          label: 'Calendario',
          path: '/calendario',
          icon: CalendarDays,
          matchOptions: { exact: true },
        },
      ],
    },
  ];

  protected readonly footerNavigation: readonly NavigationItem[] = this.navGroups.flatMap(
    (g) => g.items,
  );
  protected readonly backofficeLinkLabel = computed(() => {
    const role = this.authStore.currentRole();
    if (role === 'ADMIN' || hasBackofficeUiAdminOverride(role)) {
      return 'Backoffice';
    }

    if (role === 'PRESIDENT' || role === 'PLAYER') {
      return 'Mi equipo';
    }

    return null;
  });
  protected readonly backofficeNavigationItem = computed<NavigationItem | null>(() => {
    const label = this.backofficeLinkLabel();

    if (!label) {
      return null;
    }

    return {
      label,
      path: '/backoffice',
      icon: this.dashboardIcon,
      matchOptions: { exact: false },
    };
  });

  protected userInitials(): string {
    const name = this.authStore.user()?.displayName ?? '';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0] ?? '')
      .join('')
      .toUpperCase();
  }

  protected isGroupActive(group: NavGroup): boolean {
    return group.items.some((item) =>
      this.router.isActive(item.path, {
        paths: item.matchOptions.exact ? 'exact' : 'subset',
        queryParams: 'ignored',
        fragment: 'ignored',
        matrixParams: 'ignored',
      }),
    );
  }

  protected toggleDropdown(id: string): void {
    this.openDropdown.update((current) => (current === id ? null : id));
    this.isUserMenuOpen.set(false);
  }

  protected closeDropdowns(): void {
    this.openDropdown.set(null);
  }

  protected toggleNavigation(): void {
    this.isNavigationOpen.update((isOpen) => !isOpen);
    this.isUserMenuOpen.set(false);
    this.openDropdown.set(null);
  }

  protected closeNavigation(): void {
    this.isNavigationOpen.set(false);
  }

  protected toggleUserMenu(): void {
    this.isUserMenuOpen.update((v) => !v);
    this.openDropdown.set(null);
  }

  protected closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  protected onEscape(): void {
    this.isNavigationOpen.set(false);
    this.isUserMenuOpen.set(false);
    this.openDropdown.set(null);
  }

  protected onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isUserMenuOpen.set(false);
      this.openDropdown.set(null);
    }
  }

  protected async onLogout(): Promise<void> {
    this.isUserMenuOpen.set(false);
    this.closeNavigation();
    await this.authStore.logout();
    await this.router.navigate(['/']);
  }
}
