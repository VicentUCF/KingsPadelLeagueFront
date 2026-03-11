import {
  type LeagueHomeSnapshot,
  type NextMatchSummary,
  type StandingEntry,
} from '@features/league-home/domain/entities/league-home-snapshot';

import { type LeagueHomeRepository } from '../ports/league-home.repository';

export class LoadLeagueHomeSnapshotUseCase {
  constructor(private readonly leagueHomeRepository: LeagueHomeRepository) {}

  async execute(): Promise<LeagueHomeSnapshot> {
    const snapshot = await this.leagueHomeRepository.loadSnapshot();

    return {
      ...snapshot,
      standings: sortStandings(snapshot.standings),
      nextMatches: sortMatches(snapshot.nextMatches),
      lastResults: snapshot.lastResults.slice(0, 3),
    };
  }
}

function sortStandings(standings: readonly StandingEntry[]): readonly StandingEntry[] {
  return [...standings]
    .sort((leftEntry, rightEntry) => {
      if (rightEntry.points !== leftEntry.points) {
        return rightEntry.points - leftEntry.points;
      }

      if (rightEntry.gameDifference !== leftEntry.gameDifference) {
        return rightEntry.gameDifference - leftEntry.gameDifference;
      }

      return leftEntry.teamName.localeCompare(rightEntry.teamName, 'es');
    })
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
    }));
}

function sortMatches(matches: readonly NextMatchSummary[]): readonly NextMatchSummary[] {
  return [...matches].sort((leftMatch, rightMatch) => {
    return Date.parse(leftMatch.scheduledAtIso) - Date.parse(rightMatch.scheduledAtIso);
  });
}
