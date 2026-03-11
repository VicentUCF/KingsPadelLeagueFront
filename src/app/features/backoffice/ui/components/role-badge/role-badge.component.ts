import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { type BackofficeRole } from '../../../domain/entities/backoffice-role';

@Component({
  selector: 'app-role-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'role-badge',
  },
  templateUrl: './role-badge.component.html',
  styleUrl: './role-badge.component.scss',
})
export class RoleBadgeComponent {
  readonly role = input.required<BackofficeRole>();
}
