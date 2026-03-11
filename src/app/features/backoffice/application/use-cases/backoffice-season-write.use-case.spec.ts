import {
  type BackofficeSeasonDetail,
  type BackofficeSeasonSummary,
} from '@features/backoffice/domain/entities/backoffice-season.entity';
import { BackofficeSeasonsRepository } from '@features/backoffice/application/ports/backoffice-seasons.repository';
import { type ChangeStatusBackofficeSeasonCommand } from '@features/backoffice/application/commands/backoffice-season.commands';

import { ChangeBackofficeSeasonStatusUseCase } from './change-backoffice-season-status.use-case';
import { CreateBackofficeSeasonUseCase } from './create-backoffice-season.use-case';
import { UpdateBackofficeSeasonUseCase } from './update-backoffice-season.use-case';

describe('backoffice season write use cases', () => {
  it('creates draft seasons by default', async () => {
    const repository = new BackofficeSeasonsRepositoryStub([
      createSeasonSummary('season-2026', 'Temporada 2026', 'ACTIVE'),
    ]);

    const useCase = new CreateBackofficeSeasonUseCase(repository);
    const season = await useCase.execute({
      name: 'Temporada 2028',
      year: 2028,
      startDate: '2028-03-01',
      endDate: '2028-06-30',
      notes: ['Nueva season'],
    });

    expect(season.status).toBe('DRAFT');
    expect(repository.createdCommands[0]?.status).toBe('DRAFT');
  });

  it('rejects activating another season when one is already active', async () => {
    const repository = new BackofficeSeasonsRepositoryStub([
      createSeasonSummary('season-2026', 'Temporada 2026', 'ACTIVE'),
      createSeasonSummary('season-2027', 'Temporada 2027', 'DRAFT'),
    ]);

    const useCase = new UpdateBackofficeSeasonUseCase(repository);

    await expect(
      useCase.execute({
        id: 'season-2027',
        name: 'Temporada 2027',
        year: 2027,
        startDate: '2027-03-01',
        endDate: '2027-06-30',
        notes: ['Season editable'],
        status: 'ACTIVE',
      }),
    ).rejects.toThrow(/Ya existe una season activa/i);
  });

  it('allows the expected status transitions only', async () => {
    const repository = new BackofficeSeasonsRepositoryStub([
      createSeasonSummary('season-2026', 'Temporada 2026', 'ACTIVE'),
    ]);

    const useCase = new ChangeBackofficeSeasonStatusUseCase(repository);
    const season = await useCase.execute({
      seasonId: 'season-2026',
      targetStatus: 'FINISHED',
    });

    expect(season.status).toBe('FINISHED');
    expect(repository.changedStatusCommands).toEqual([
      {
        seasonId: 'season-2026',
        targetStatus: 'FINISHED',
      },
    ]);

    await expect(
      useCase.execute({
        seasonId: 'season-2026',
        targetStatus: 'ACTIVE',
      }),
    ).rejects.toThrow(/no está permitida/i);
  });
});

class BackofficeSeasonsRepositoryStub extends BackofficeSeasonsRepository {
  readonly createdCommands: { readonly status: BackofficeSeasonDetail['status'] }[] = [];
  readonly changedStatusCommands: ChangeStatusBackofficeSeasonCommand[] = [];

  constructor(private seasons: BackofficeSeasonDetail[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficeSeasonSummary[]> {
    return this.seasons.map((season) => ({
      id: season.id,
      name: season.name,
      year: season.year,
      status: season.status,
      startDate: season.startDate,
      endDate: season.endDate,
      scheduleLabel: season.scheduleLabel,
      teamCount: season.teamCount,
      matchdayCount: season.matchdayCount,
    }));
  }

  override async findById(seasonId: string): Promise<BackofficeSeasonDetail | null> {
    return this.seasons.find((season) => season.id === seasonId) ?? null;
  }

  override async create(command: {
    readonly status?: BackofficeSeasonDetail['status'];
    readonly name: string;
    readonly year: number;
    readonly startDate: string;
    readonly endDate: string;
    readonly notes: readonly string[];
  }): Promise<BackofficeSeasonDetail> {
    this.createdCommands.push({ status: command.status ?? 'DRAFT' });

    const season = createSeasonSummary(
      `season-${command.year}`,
      command.name,
      command.status ?? 'DRAFT',
    );
    this.seasons = [...this.seasons, season];

    return season;
  }

  override async update(command: {
    readonly id: string;
    readonly name: string;
    readonly year: number;
    readonly startDate: string;
    readonly endDate: string;
    readonly notes: readonly string[];
    readonly status: BackofficeSeasonDetail['status'];
  }): Promise<BackofficeSeasonDetail> {
    const season = createSeasonSummary(command.id, command.name, command.status);

    this.seasons = this.seasons.map((existingSeason) =>
      existingSeason.id === command.id ? season : existingSeason,
    );

    return season;
  }

  override async changeStatus(command: {
    readonly seasonId: string;
    readonly targetStatus: ChangeStatusBackofficeSeasonCommand['targetStatus'];
  }): Promise<BackofficeSeasonDetail> {
    this.changedStatusCommands.push(command);

    const currentSeason = this.seasons.find((season) => season.id === command.seasonId);

    if (!currentSeason) {
      throw new Error('Not found');
    }

    const updatedSeason = createSeasonSummary(
      currentSeason.id,
      currentSeason.name,
      command.targetStatus,
    );

    this.seasons = this.seasons.map((season) =>
      season.id === command.seasonId ? updatedSeason : season,
    );

    return updatedSeason;
  }
}

function createSeasonSummary(
  id: string,
  name: string,
  status: BackofficeSeasonDetail['status'],
): BackofficeSeasonDetail {
  return {
    id,
    name,
    year: Number.parseInt(id.replace(/\D+/g, ''), 10) || 2026,
    status,
    startDate: '2026-03-03',
    endDate: '2026-06-28',
    scheduleLabel: '3 marzo · 28 junio',
    teamCount: 5,
    matchdayCount: 7,
    notes: [],
    teams: [],
    matchdays: [],
    standings: [],
  };
}
