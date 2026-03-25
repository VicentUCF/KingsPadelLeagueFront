import { inject, Injectable, signal } from '@angular/core';

import { ActionToastStore } from '@core/state/action-toast.store';
import { BackofficeMatchdaysRepository } from '@features/backoffice/application/ports/backoffice-matchdays.repository';
import {
  BACKOFFICE_MATCHES_REPOSITORY,
  type BackofficeMatchesRepository,
  type CreateBackofficeMatchInput,
} from '@features/backoffice/application/ports/backoffice-matches.repository';
import {
  BACKOFFICE_PAIR_MATCHES_REPOSITORY,
  type BackofficePairMatchesRepository,
  type FinishBackofficePairMatchInput,
} from '@features/backoffice/application/ports/backoffice-pair-matches.repository';
import type { BackofficePairMatch } from '@features/backoffice/domain/entities/backoffice-pair-match';
import { BackofficeLineupsStore } from './backoffice-lineups.store';
import { BackofficeMatchdaysStore } from './backoffice-matchdays.store';
import { BackofficePlayersStore } from './backoffice-players.store';
import { BackofficeTeamsStore } from './backoffice-teams.store';

@Injectable()
export class BackofficeAdminMatchdayOperationsStore {
  private readonly matchdaysRepository = inject(BackofficeMatchdaysRepository);
  private readonly matchesRepository = inject<BackofficeMatchesRepository>(
    BACKOFFICE_MATCHES_REPOSITORY,
  );
  private readonly pairMatchesRepository = inject<BackofficePairMatchesRepository>(
    BACKOFFICE_PAIR_MATCHES_REPOSITORY,
  );
  private readonly matchdaysStore = inject(BackofficeMatchdaysStore);
  private readonly lineupsStore = inject(BackofficeLineupsStore);
  private readonly teamsStore = inject(BackofficeTeamsStore);
  private readonly playersStore = inject(BackofficePlayersStore);
  private readonly toastStore = inject(ActionToastStore);

  readonly pairMatches = signal<readonly BackofficePairMatch[]>([]);
  readonly isLoadingPairMatches = signal(false);
  readonly pairMatchesErrorMessage = signal<string | null>(null);

  readonly isCreatingMatchday = signal(false);
  readonly isStartingMatchday = signal(false);
  readonly isFinishingMatchday = signal(false);
  readonly isCreatingPairMatches = signal(false);
  readonly isCreatingMatch = signal(false);
  readonly matchActionIds = signal<Record<string, 'starting' | 'finishing' | 'updating-mvp'>>({});
  readonly pairMatchActionIds = signal<Record<string, 'finishing'>>({});

  async loadPairMatches(forceRefresh = false): Promise<void> {
    if (!forceRefresh && this.pairMatches().length > 0) return;

    const lineupPairIds = this.lineupsStore.pairs().map((pair) => pair.id);
    if (lineupPairIds.length === 0) {
      this.pairMatches.set([]);
      this.pairMatchesErrorMessage.set(null);
      return;
    }

    this.isLoadingPairMatches.set(true);
    this.pairMatchesErrorMessage.set(null);

    try {
      const pairMatches = await this.pairMatchesRepository.loadByLineupPairIds(lineupPairIds);
      this.pairMatches.set(pairMatches);
    } catch {
      this.pairMatchesErrorMessage.set('No hemos podido cargar los pair matches.');
    } finally {
      this.isLoadingPairMatches.set(false);
    }
  }

  async createMatchday(input: {
    readonly name: string;
    readonly scheduledAt: string;
    readonly seasonId: string;
  }): Promise<string | null> {
    this.isCreatingMatchday.set(true);
    try {
      const matchday = await this.matchdaysRepository.create(input);
      await this.matchdaysStore.load(true);
      this.toastStore.success('La jornada se ha creado correctamente.', 'Jornada creada');
      return matchday.id;
    } catch {
      this.toastStore.error('No hemos podido crear la jornada.', 'Jornada no creada');
      return null;
    } finally {
      this.isCreatingMatchday.set(false);
    }
  }

  async startMatchday(matchdayId: string): Promise<void> {
    this.isStartingMatchday.set(true);
    try {
      await this.matchdaysRepository.start(matchdayId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('La jornada ya está en curso.', 'Jornada iniciada');
    } catch {
      this.toastStore.error('No hemos podido iniciar la jornada.', 'Acción no completada');
    } finally {
      this.isStartingMatchday.set(false);
    }
  }

  async finishMatchday(matchdayId: string): Promise<void> {
    this.isFinishingMatchday.set(true);
    try {
      await this.matchdaysRepository.finish(matchdayId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('La jornada ha quedado finalizada.', 'Jornada finalizada');
    } catch {
      this.toastStore.error('No hemos podido finalizar la jornada.', 'Acción no completada');
    } finally {
      this.isFinishingMatchday.set(false);
    }
  }

  async createPairMatches(matchdayId: string): Promise<void> {
    this.isCreatingPairMatches.set(true);
    try {
      await this.matchdaysRepository.createPairMatches(matchdayId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success(
        'Los pair matches se han generado correctamente.',
        'Pair matches generados',
      );
    } catch {
      this.toastStore.error('No hemos podido generar los pair matches.', 'Acción no completada');
    } finally {
      this.isCreatingPairMatches.set(false);
    }
  }

  async createMatch(input: CreateBackofficeMatchInput): Promise<void> {
    this.isCreatingMatch.set(true);
    try {
      await this.matchesRepository.create(input);
      await this.refreshMatchdayContext(input.matchdayId);
      this.toastStore.success('El partido se ha creado correctamente.', 'Partido creado');
    } catch {
      this.toastStore.error('No hemos podido crear el partido.', 'Partido no creado');
    } finally {
      this.isCreatingMatch.set(false);
    }
  }

  async startMatch(matchdayId: string, matchId: string): Promise<void> {
    this.setMatchAction(matchId, 'starting');
    try {
      await this.matchesRepository.start(matchId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('El partido ya está en juego.', 'Partido iniciado');
    } catch {
      this.toastStore.error('No hemos podido iniciar el partido.', 'Acción no completada');
    } finally {
      this.clearMatchAction(matchId);
    }
  }

  async finishMatch(matchdayId: string, matchId: string): Promise<void> {
    this.setMatchAction(matchId, 'finishing');
    try {
      await this.matchesRepository.finish(matchId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('El partido ha quedado finalizado.', 'Partido finalizado');
    } catch {
      this.toastStore.error('No hemos podido finalizar el partido.', 'Acción no completada');
    } finally {
      this.clearMatchAction(matchId);
    }
  }

  async updateMatchMvp(matchdayId: string, matchId: string, mvpId: string | null): Promise<void> {
    this.setMatchAction(matchId, 'updating-mvp');
    try {
      await this.matchesRepository.updateMvp(matchId, mvpId);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('El MVP se ha actualizado.', 'MVP actualizado');
    } catch {
      this.toastStore.error('No hemos podido actualizar el MVP.', 'Acción no completada');
    } finally {
      this.clearMatchAction(matchId);
    }
  }

  async finishPairMatch(
    matchdayId: string,
    pairMatchId: string,
    input: FinishBackofficePairMatchInput,
  ): Promise<void> {
    this.pairMatchActionIds.update((state) => ({ ...state, [pairMatchId]: 'finishing' }));
    try {
      await this.pairMatchesRepository.finish(pairMatchId, input);
      await this.refreshMatchdayContext(matchdayId);
      this.toastStore.success('El resultado se ha guardado correctamente.', 'Resultado registrado');
    } catch {
      this.toastStore.error(
        'No hemos podido guardar el resultado del pair match.',
        'Acción no completada',
      );
    } finally {
      this.pairMatchActionIds.update((state) => {
        const next = { ...state };
        delete next[pairMatchId];
        return next;
      });
    }
  }

  private async refreshMatchdayContext(matchdayId: string): Promise<void> {
    await Promise.all([
      this.matchdaysStore.load(true),
      this.teamsStore.load(true),
      this.playersStore.load(true),
      this.lineupsStore.loadForMatchday(matchdayId, true),
    ]);
    await this.loadPairMatches(true);
  }

  private setMatchAction(matchId: string, action: 'starting' | 'finishing' | 'updating-mvp'): void {
    this.matchActionIds.update((state) => ({ ...state, [matchId]: action }));
  }

  private clearMatchAction(matchId: string): void {
    this.matchActionIds.update((state) => {
      const next = { ...state };
      delete next[matchId];
      return next;
    });
  }
}
