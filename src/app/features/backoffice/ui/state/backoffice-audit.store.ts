import { computed, inject, Injectable, signal } from '@angular/core';

import { LoadBackofficeAuditUseCase } from '@features/backoffice/application/use-cases/load-backoffice-audit.use-case';
import type {
  BackofficeAuditAction,
  BackofficeAuditEntityType,
} from '@features/backoffice/domain/entities/backoffice-audit-entry';
import {
  toBackofficeAuditEntryViewModel,
  type BackofficeAuditEntryViewModel,
} from '../models/backoffice-audit.viewmodel';

@Injectable()
export class BackofficeAuditStore {
  private readonly loadUseCase = inject(LoadBackofficeAuditUseCase);

  readonly entries = signal<readonly BackofficeAuditEntryViewModel[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly totalToday = computed(() => {
    const today = new Date();
    return this.entries().filter((e) => {
      const d = new Date(e.timestamp);
      return (
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear()
      );
    }).length;
  });

  filteredEntries(
    search: string,
    entityFilter: BackofficeAuditEntityType | 'all',
    actionFilter: BackofficeAuditAction | 'all',
  ): readonly BackofficeAuditEntryViewModel[] {
    const term = search.toLowerCase();
    return this.entries().filter((e) => {
      if (entityFilter !== 'all' && e.entityTypeLabel !== this.entityLabel(entityFilter))
        return false;
      if (actionFilter !== 'all' && e.action !== actionFilter) return false;
      if (!term) return true;
      return (
        e.actorName.toLowerCase().includes(term) ||
        e.entityName.toLowerCase().includes(term) ||
        e.actionLabel.toLowerCase().includes(term) ||
        (e.details?.toLowerCase().includes(term) ?? false)
      );
    });
  }

  async load(): Promise<void> {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    try {
      const raw = await this.loadUseCase.execute();
      const now = new Date();
      this.entries.set(raw.map((e) => toBackofficeAuditEntryViewModel(e, now)));
    } catch {
      this.errorMessage.set('No se pudo cargar el registro de auditoría.');
    } finally {
      this.isLoading.set(false);
    }
  }

  private entityLabel(type: BackofficeAuditEntityType): string {
    const map: Record<BackofficeAuditEntityType, string> = {
      player: 'Jugador',
      team: 'Equipo',
      season: 'Temporada',
      matchday: 'Jornada',
      match: 'Partido',
      lineup: 'Alineación',
      user: 'Usuario',
      session: 'Sesión',
    };
    return map[type];
  }
}
