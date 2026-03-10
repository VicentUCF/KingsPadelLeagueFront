import { type ScheduledMatchesRepository } from '@features/matches/application/ports/scheduled-matches.repository';
import { type PadelMatch } from '@features/matches/domain/entities/padel-match.entity';

export class LoadUpcomingMatchesUseCase {
  constructor(private readonly scheduledMatchesRepository: ScheduledMatchesRepository) {}

  async execute(referenceDate: Date = new Date()): Promise<readonly PadelMatch[]> {
    const scheduledMatches = await this.scheduledMatchesRepository.findScheduled();

    return scheduledMatches
      .filter((match) => match.isScheduledAfter(referenceDate))
      .sort((leftMatch, rightMatch) => {
        return leftMatch.scheduledAt.getTime() - rightMatch.scheduledAt.getTime();
      });
  }
}
