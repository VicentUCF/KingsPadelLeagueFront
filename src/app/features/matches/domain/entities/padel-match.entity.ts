const REQUIRED_PLAYERS_COUNT = 4;

export class PadelMatch {
  constructor(
    readonly id: string,
    readonly clubName: string,
    readonly courtName: string,
    readonly scheduledAt: Date,
    readonly confirmedPlayers: readonly string[],
  ) {}

  get isReady(): boolean {
    return this.confirmedPlayers.length >= REQUIRED_PLAYERS_COUNT;
  }

  get missingPlayersCount(): number {
    return Math.max(0, REQUIRED_PLAYERS_COUNT - this.confirmedPlayers.length);
  }

  get requiredPlayersCount(): number {
    return REQUIRED_PLAYERS_COUNT;
  }

  isScheduledAfter(referenceDate: Date): boolean {
    return this.scheduledAt.getTime() >= referenceDate.getTime();
  }
}
