export type BackofficeRosterStatus = 'HEALTHY' | 'REVIEW' | 'CLOSED';
export type BackofficeRosterMembershipType = 'REGULAR' | 'GUEST';
export type BackofficeRosterMembershipStatus = 'ACTIVE' | 'ENDED' | 'REMOVED';
export type BackofficeRosterTabId = 'memberships' | 'pending' | 'history' | 'rules';

export interface BackofficeRosterSummary {
  readonly id: string;
  readonly teamId: string;
  readonly teamName: string;
  readonly teamShortName: string;
  readonly seasonLabel: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly status: BackofficeRosterStatus;
  readonly regularSlotsUsed: number;
  readonly regularSlotsLimit: number;
  readonly activeGuestCount: number;
  readonly pendingRequestsCount: number;
  readonly validityLabel: string;
}

export interface BackofficeRosterMembership {
  readonly playerId: string | null;
  readonly playerName: string;
  readonly membershipType: BackofficeRosterMembershipType;
  readonly status: BackofficeRosterMembershipStatus;
  readonly effectiveFromLabel: string;
  readonly effectiveToLabel: string | null;
  readonly note: string;
}

export interface BackofficeRosterPendingRequest {
  readonly label: string;
  readonly requestedBy: string;
  readonly effectiveFromLabel: string;
  readonly statusLabel: string;
}

export interface BackofficeRosterHistoryEntry {
  readonly label: string;
  readonly happenedAtLabel: string;
}

export interface BackofficeRosterRestrictionNote {
  readonly label: string;
  readonly description: string;
}

export interface BackofficeRosterDetail extends BackofficeRosterSummary {
  readonly members: readonly BackofficeRosterMembership[];
  readonly pendingRequests: readonly BackofficeRosterPendingRequest[];
  readonly history: readonly BackofficeRosterHistoryEntry[];
  readonly restrictions: readonly BackofficeRosterRestrictionNote[];
}
