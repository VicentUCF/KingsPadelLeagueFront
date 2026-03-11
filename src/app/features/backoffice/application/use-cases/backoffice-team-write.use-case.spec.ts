import {
  type BackofficeTeamDetail,
  type BackofficeTeamSummary,
} from '@features/backoffice/domain/entities/backoffice-team.entity';
import { BackofficeTeamsRepository } from '@features/backoffice/application/ports/backoffice-teams.repository';

import { ChangeBackofficeTeamStatusUseCase } from './change-backoffice-team-status.use-case';
import { CreateBackofficeTeamUseCase } from './create-backoffice-team.use-case';
import { UpdateBackofficeTeamUseCase } from './update-backoffice-team.use-case';

describe('backoffice team write use cases', () => {
  it('creates teams through the repository contract', async () => {
    const repository = new BackofficeTeamsRepositoryStub([
      createTeamDetail('barbaridad', 'Barbaridad', 'ACTIVE'),
    ]);

    const useCase = new CreateBackofficeTeamUseCase(repository);
    const team = await useCase.execute({
      name: 'Magic City',
      shortName: 'MGC',
      presidentName: 'Riera',
      primaryColor: '#123456',
      secondaryColor: '#654321',
    });

    expect(team.name).toBe('Magic City');
    expect(repository.createdTeams).toHaveLength(1);
  });

  it('updates teams through the repository contract', async () => {
    const repository = new BackofficeTeamsRepositoryStub([
      createTeamDetail('barbaridad', 'Barbaridad', 'ACTIVE'),
    ]);

    const useCase = new UpdateBackofficeTeamUseCase(repository);
    const team = await useCase.execute({
      id: 'barbaridad',
      name: 'Barbaridad Club',
      shortName: 'BAR',
      presidentName: 'Romero',
      primaryColor: '#112233',
      secondaryColor: '#445566',
    });

    expect(team.name).toBe('Barbaridad Club');
  });

  it('allows only the configured soft-delete transitions', async () => {
    const repository = new BackofficeTeamsRepositoryStub([
      createTeamDetail('barbaridad', 'Barbaridad', 'ACTIVE'),
    ]);

    const useCase = new ChangeBackofficeTeamStatusUseCase(repository);
    const team = await useCase.execute({
      teamId: 'barbaridad',
      targetStatus: 'INACTIVE',
    });

    expect(team.status).toBe('INACTIVE');

    await expect(
      useCase.execute({
        teamId: 'barbaridad',
        targetStatus: 'INACTIVE',
      }),
    ).rejects.toThrow(/no está permitida/i);
  });
});

class BackofficeTeamsRepositoryStub extends BackofficeTeamsRepository {
  readonly createdTeams: BackofficeTeamDetail[] = [];

  constructor(private teams: BackofficeTeamDetail[]) {
    super();
  }

  override async findAll(): Promise<readonly BackofficeTeamSummary[]> {
    return this.teams;
  }

  override async findById(teamId: string): Promise<BackofficeTeamDetail | null> {
    return this.teams.find((team) => team.id === teamId) ?? null;
  }

  override async create(command: {
    readonly name: string;
    readonly shortName: string;
    readonly presidentName: string;
    readonly primaryColor: string;
    readonly secondaryColor: string;
  }): Promise<BackofficeTeamDetail> {
    const team = createTeamDetail(
      command.name.toLocaleLowerCase('es').replaceAll(' ', '-'),
      command.name,
      'ACTIVE',
    );

    this.createdTeams.push(team);
    this.teams = [...this.teams, team];

    return team;
  }

  override async update(command: {
    readonly id: string;
    readonly name: string;
  }): Promise<BackofficeTeamDetail> {
    const team = createTeamDetail(command.id, command.name, 'ACTIVE');

    this.teams = this.teams.map((existingTeam) =>
      existingTeam.id === command.id ? team : existingTeam,
    );

    return team;
  }

  override async changeStatus(command: {
    readonly teamId: string;
    readonly targetStatus: BackofficeTeamDetail['status'];
  }): Promise<BackofficeTeamDetail> {
    const currentTeam = this.teams.find((team) => team.id === command.teamId);

    if (!currentTeam) {
      throw new Error('Not found');
    }

    const updatedTeam = createTeamDetail(currentTeam.id, currentTeam.name, command.targetStatus);

    this.teams = this.teams.map((team) => (team.id === command.teamId ? updatedTeam : team));

    return updatedTeam;
  }
}

function createTeamDetail(
  id: string,
  name: string,
  status: BackofficeTeamDetail['status'],
): BackofficeTeamDetail {
  return {
    id,
    name,
    shortName: 'BAR',
    primaryColor: '#123456',
    secondaryColor: '#654321',
    presidentName: 'Romero',
    activeRegularPlayersCount: 4,
    status,
    seasonLabel: 'Temporada 2026',
    visualIdentityLabel: 'Color principal #123456 con acento #654321.',
    roleAssignments: [],
    rosterMembers: [],
    fixtures: [],
    sanctions: [],
    mvpHistory: [],
  };
}
