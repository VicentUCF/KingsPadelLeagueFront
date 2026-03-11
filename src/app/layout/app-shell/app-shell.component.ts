import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  ArrowRight,
  CalendarDays,
  Crown,
  House,
  LucideAngularModule,
  Menu,
  Shield,
  Swords,
  Trophy,
  type LucideIconData,
  X,
} from 'lucide-angular';

import { applicationMetadata } from '@core/config/application-metadata';

interface NavigationItem {
  readonly label: string;
  readonly path: string;
  readonly icon: LucideIconData;
  readonly matchOptions: {
    readonly exact: boolean;
  };
}

@Component({
  selector: 'app-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'app-shell',
  },
  imports: [LucideAngularModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
})
export class AppShellComponent {
  protected readonly applicationMetadata = applicationMetadata;
  protected readonly crownIcon = Crown;
  protected readonly menuIcon = Menu;
  protected readonly closeIcon = X;
  protected readonly arrowRightIcon = ArrowRight;
  protected readonly isNavigationOpen = signal(false);

  protected readonly primaryNavigation: readonly NavigationItem[] = [
    {
      label: 'Home',
      path: '/',
      icon: House,
      matchOptions: {
        exact: true,
      },
    },
    {
      label: 'Clasificación',
      path: '/clasificacion',
      icon: Trophy,
      matchOptions: {
        exact: true,
      },
    },
    {
      label: 'Jornadas',
      path: '/jornadas',
      icon: Swords,
      matchOptions: {
        exact: true,
      },
    },
    {
      label: 'Equipos',
      path: '/equipos',
      icon: Shield,
      matchOptions: {
        exact: true,
      },
    },
    {
      label: 'Calendario',
      path: '/calendario',
      icon: CalendarDays,
      matchOptions: {
        exact: true,
      },
    },
  ];

  protected readonly footerNavigation = this.primaryNavigation.filter((item) => item.path !== '/');

  protected toggleNavigation(): void {
    this.isNavigationOpen.update((isOpen) => !isOpen);
  }

  protected closeNavigation(): void {
    this.isNavigationOpen.set(false);
  }
}
