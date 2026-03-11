import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';

@Component({
  selector: 'app-action-toast-outlet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'action-toast-outlet',
  },
  templateUrl: './action-toast-outlet.component.html',
  styleUrl: './action-toast-outlet.component.scss',
})
export class ActionToastOutletComponent {
  protected readonly store = inject(ActionToastStore);

  protected dismiss(toastId: string): void {
    this.store.dismiss(toastId);
  }
}
