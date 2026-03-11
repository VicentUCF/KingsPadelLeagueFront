import {
  type BackofficePlayerMembershipSummary,
  type BackofficePlayerMvpNominationSummary,
  type BackofficePlayerParticipationSummary,
  type BackofficePlayerStatus,
} from '@features/backoffice/domain/entities/backoffice-player.entity';
import {
  type BackofficeSeasonMatchdaySummary,
  type BackofficeSeasonStandingEntry,
} from '@features/backoffice/domain/entities/backoffice-season.entity';
import { type BackofficeSeasonStatus } from '@features/backoffice/domain/entities/backoffice-season-status';
import {
  type BackofficeTeamFixtureSummary,
  type BackofficeTeamMvpEntry,
  type BackofficeTeamRoleAssignment,
  type BackofficeTeamRosterMember,
  type BackofficeTeamSanctionSummary,
  type BackofficeTeamStatus,
} from '@features/backoffice/domain/entities/backoffice-team.entity';

export interface InMemoryBackofficeSeasonRecord {
  readonly id: string;
  readonly name: string;
  readonly year: number;
  readonly status: BackofficeSeasonStatus;
  readonly startDate: string;
  readonly endDate: string;
  readonly notes: readonly string[];
  readonly matchdays: readonly BackofficeSeasonMatchdaySummary[];
  readonly standings: readonly BackofficeSeasonStandingEntry[];
}

export interface InMemoryBackofficeTeamRecord {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly primaryColor: string;
  readonly secondaryColor: string;
  readonly presidentName: string;
  readonly activeRegularPlayersCount: number;
  readonly status: BackofficeTeamStatus;
  readonly seasonId: string;
  readonly roleAssignments: readonly BackofficeTeamRoleAssignment[];
  readonly rosterMembers: readonly BackofficeTeamRosterMember[];
  readonly fixtures: readonly BackofficeTeamFixtureSummary[];
  readonly sanctions: readonly BackofficeTeamSanctionSummary[];
  readonly mvpHistory: readonly BackofficeTeamMvpEntry[];
}

export interface InMemoryBackofficePlayerRecord {
  readonly id: string;
  readonly fullName: string;
  readonly nickName: string;
  readonly avatarPath: string | null;
  readonly status: BackofficePlayerStatus;
  readonly preferredSideLabel: string;
  readonly linkedUserEmail: string | null;
  readonly currentTeamId: string | null;
  readonly historicalMemberships: readonly BackofficePlayerMembershipSummary[];
  readonly participations: readonly BackofficePlayerParticipationSummary[];
  readonly mvpNominations: readonly BackofficePlayerMvpNominationSummary[];
}

export interface InMemoryBackofficeState {
  readonly seasons: readonly InMemoryBackofficeSeasonRecord[];
  readonly teams: readonly InMemoryBackofficeTeamRecord[];
  readonly players: readonly InMemoryBackofficePlayerRecord[];
}
