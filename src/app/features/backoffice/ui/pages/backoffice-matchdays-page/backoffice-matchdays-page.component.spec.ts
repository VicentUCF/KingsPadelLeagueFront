import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import type { BackofficeRole } from '@features/backoffice/domain/entities/backoffice-role';
import type { BackofficeMatchdayRowViewModel } from '../../models/backoffice-matchdays.viewmodel';
import { BackofficeMatchdaysStore } from '../../state/backoffice-matchdays.store';
import { BackofficeSessionStore } from '../../state/backoffice-session.store';
import { BackofficeSeasonsStore } from '../../state/backoffice-seasons.store';
import { BackofficeAdminMatchdayOperationsStore } from '../../state/backoffice-admin-matchday-operations.store';
import { BackofficeMatchdaysPageComponent } from './backoffice-matchdays-page.component';

function createMatchdayRow(
  overrides: Partial<BackofficeMatchdayRowViewModel> = {},
): BackofficeMatchdayRowViewModel {
  return {
    id: 'matchday-1',
    name: 'Jornada 1',
    dateLabel: 'dom, 18 mar 2026',
    statusLabel: 'En curso',
    statusTone: 'success',
    seasonId: 'season-1',
    detailPath: '/backoffice/jornadas/matchday-1',
    ...overrides,
  };
}

function createMatchdaysStoreMock(options: {
  readonly errorMessage?: string | null;
  readonly hasContent?: boolean;
  readonly isLoading?: boolean;
  readonly rows?: readonly BackofficeMatchdayRowViewModel[];
}) {
  return {
    rows: signal(options.rows ?? []),
    isLoading: signal(options.isLoading ?? false),
    errorMessage: signal(options.errorMessage ?? null),
    hasContent: signal(options.hasContent ?? false),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<
    BackofficeMatchdaysStore,
    'errorMessage' | 'hasContent' | 'isLoading' | 'load' | 'rows'
  >;
}

function createSessionStoreMock(role: BackofficeRole = 'ADMIN') {
  return {
    currentRole: signal(role),
  } satisfies Pick<BackofficeSessionStore, 'currentRole'>;
}

function createSeasonsStoreMock() {
  return {
    seasons: signal([
      {
        id: 'season-1',
        name: 'Temporada 2026',
        description: 'Season test',
        startsAt: '2026-01-01T00:00:00.000Z',
        endsAt: '2026-12-31T23:59:59.000Z',
      },
    ]),
    load: jest.fn().mockResolvedValue(undefined),
  } satisfies Pick<BackofficeSeasonsStore, 'load' | 'seasons'>;
}

function createAdminOperationsStoreMock() {
  return {
    isCreatingMatchday: signal(false),
    createMatchday: jest.fn().mockResolvedValue('matchday-1'),
  } satisfies Pick<BackofficeAdminMatchdayOperationsStore, 'isCreatingMatchday' | 'createMatchday'>;
}

describe('BackofficeMatchdaysPageComponent', () => {
  it('shows the shared loading state during the first blocking load', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      hasContent: false,
      isLoading: true,
    });

    await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock() },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    expect(
      screen.getByText(/Cargando jornadas/i, { selector: '.loading-state__heading' }),
    ).toBeVisible();
    expect(matchdaysStore.load).toHaveBeenCalledTimes(1);
  });

  it('renders the available rows once the data is loaded', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      hasContent: true,
      rows: [createMatchdayRow()],
    });

    await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock() },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    expect(screen.getByText('Jornada 1')).toBeVisible();
    expect(screen.getByRole('link', { name: /Ver/i })).toHaveAttribute(
      'href',
      '/backoffice/jornadas/matchday-1',
    );
  });

  it('hides the create matchday CTA for non-admin users', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      hasContent: true,
      rows: [createMatchdayRow()],
    });

    await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock('PRESIDENT') },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    expect(screen.queryByRole('button', { name: /Nueva jornada/i })).not.toBeInTheDocument();
  });

  it('keeps the list visible and shows inline feedback when a refresh fails', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      errorMessage: 'No hemos podido actualizar las jornadas.',
      hasContent: true,
      isLoading: true,
      rows: [createMatchdayRow()],
    });

    await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock() },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    expect(screen.getByText('Jornada 1')).toBeVisible();
    expect(
      screen.getByText(/Actualizando jornadas/i, { selector: '.loading-state__heading' }),
    ).toBeVisible();
    expect(screen.getByText(/No hemos podido actualizar las jornadas/i)).toBeVisible();
  });

  it('shows a blocking retry when the first load fails', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      errorMessage: 'No hemos podido cargar las jornadas.',
      hasContent: false,
    });

    await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock() },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    await fireEvent.click(screen.getByRole('button', { name: /Reintentar/i }));

    expect(screen.getByText(/No hemos podido cargar las jornadas/i)).toBeVisible();
    expect(matchdaysStore.load).toHaveBeenNthCalledWith(2, true);
  });

  it('has no accessibility violations with loaded content', async () => {
    const matchdaysStore = createMatchdaysStoreMock({
      hasContent: true,
      rows: [createMatchdayRow()],
    });

    const { container } = await render(BackofficeMatchdaysPageComponent, {
      providers: [
        provideRouter([]),
        { provide: BackofficeMatchdaysStore, useValue: matchdaysStore },
        { provide: BackofficeSessionStore, useValue: createSessionStoreMock() },
        { provide: BackofficeSeasonsStore, useValue: createSeasonsStoreMock() },
        {
          provide: BackofficeAdminMatchdayOperationsStore,
          useValue: createAdminOperationsStoreMock(),
        },
      ],
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
