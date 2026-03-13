import type { StatusBadgeTone } from './status-badge-tone';

export interface BackofficeRosterCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly statusLabel: string;
  readonly statusTone: StatusBadgeTone;
  readonly regularSlotsLabel: string;
  readonly guestLabel: string;
  readonly pendingLabel: string;
  readonly validityLabel: string;
  readonly detailPath: string;
}
