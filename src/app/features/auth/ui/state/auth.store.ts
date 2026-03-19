import { computed, inject, Injectable, signal } from '@angular/core';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import { environment } from '../../../../../environments/environment';
import type { AuthUser } from '../../domain/entities/auth-user';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';
import {
  resolveEditablePlayerProfileDisplayName,
  type EditablePlayerProfile,
} from '../../domain/entities/editable-player-profile';
import { mapSupabaseUserToAuthUser } from '../../infrastructure/mappers/supabase-auth-user.mapper';
import { LoadEditablePlayerProfileUseCase } from '../../application/use-cases/load-editable-player-profile.use-case';
import { UpdateEditablePlayerProfileUseCase } from '../../application/use-cases/update-editable-player-profile.use-case';
import type { UpdateEditablePlayerProfileCommand } from '../../application/ports/player-profile.repository';
import { applyAuthDevOverride } from './auth-dev-override';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authDevOverride = {
    enabled: !environment.production,
    role: environment.authDevRoleOverride,
    teamId: environment.authDevTeamIdOverride,
  } as const;
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly requestPasswordResetUseCase = inject(RequestPasswordResetUseCase);
  private readonly resetPasswordUseCase = inject(ResetPasswordUseCase);
  private readonly loadEditablePlayerProfileUseCase = inject(LoadEditablePlayerProfileUseCase);
  private readonly updateEditablePlayerProfileUseCase = inject(UpdateEditablePlayerProfileUseCase);

  private readonly _status = signal<AuthStatus>('idle');
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _accessToken = signal<string | null>(null);
  private readonly initialSessionReady = createDeferred<void>();
  private initialSessionResolved = false;

  readonly status = this._status.asReadonly();
  readonly user = this._user.asReadonly();
  readonly error = this._error.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();

  readonly isAuthenticated = computed(() => this._status() === 'authenticated');
  readonly isLoading = computed(() => this._status() === 'loading');
  readonly currentRole = computed(() => this._user()?.role ?? null);

  constructor() {
    this.initSession();
  }

  private initSession(): void {
    this._status.set('loading');

    void this.supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          return this.hydrateAuthenticatedSession(data.session, {
            resolveInitialSession: true,
          });
        }

        this.setUnauthenticatedState({ resolveInitialSession: true });
        return undefined;
      })
      .catch(() => {
        this.setUnauthenticatedState({ resolveInitialSession: true });
      });

    this.supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_OUT') && !session) {
        this.setUnauthenticatedState({ resolveInitialSession: true });
      } else if (
        event === 'INITIAL_SESSION' ||
        event === 'SIGNED_IN' ||
        event === 'TOKEN_REFRESHED' ||
        event === 'USER_UPDATED'
      ) {
        if (!session) {
          this.setUnauthenticatedState({ resolveInitialSession: true });
          return;
        }

        void this.hydrateAuthenticatedSession(session, { resolveInitialSession: true });
      } else if (event === 'PASSWORD_RECOVERY') {
        // User arrived via password-reset link — keep unauthenticated state until they set a new password
        this._accessToken.set(session?.access_token ?? null);
        this.setUnauthenticatedState({
          keepAccessToken: true,
          resolveInitialSession: true,
        });
      }
    });
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getUser();
      if (!data.user) {
        this.setUnauthenticatedState();
        return;
      }

      this._user.set(
        applyAuthDevOverride(mapSupabaseUserToAuthUser(data.user), this.authDevOverride),
      );
      this._status.set('authenticated');
    } catch {
      this.setUnauthenticatedState();
    }
  }

  async ensureInitialized(): Promise<void> {
    await this.initialSessionReady.promise;
  }

  async login(email: string, password: string): Promise<void> {
    this._error.set(null);
    this._status.set('loading');
    try {
      const user = await this.loginUseCase.execute({ email, password });
      const { data } = await this.supabase.auth.getSession();

      this._accessToken.set(data.session?.access_token ?? null);
      this._user.set(applyAuthDevOverride(user, this.authDevOverride));
      this._status.set('authenticated');
      this.resolveInitialSession();
    } catch (err) {
      this.setUnauthenticatedState();
      this._error.set(err instanceof Error ? err.message : 'Error al iniciar sesión');
      throw err;
    }
  }

  async register(email: string, password: string, displayName: string): Promise<void> {
    this._error.set(null);
    this._status.set('loading');
    try {
      await this.registerUseCase.execute({ email, password, displayName });
      this._status.set('unauthenticated');
    } catch (err) {
      this._status.set('unauthenticated');
      this._error.set(err instanceof Error ? err.message : 'Error al registrarse');
      throw err;
    }
  }

  async logout(): Promise<void> {
    await this.logoutUseCase.execute();
    this.setUnauthenticatedState();
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.requestPasswordResetUseCase.execute(email);
  }

  async resetPassword(newPassword: string): Promise<void> {
    await this.resetPasswordUseCase.execute(newPassword);
  }

  async updateProfile(displayName: string): Promise<void> {
    await this.persistDisplayName(displayName);
    this.setLocalDisplayName(displayName);
  }

  async loadCurrentPlayerProfile(): Promise<EditablePlayerProfile | null> {
    const currentUser = this._user();
    if (!currentUser) {
      return null;
    }

    return this.loadEditablePlayerProfileUseCase.execute(currentUser.id);
  }

  async updateCurrentPlayerProfile(
    command: Omit<UpdateEditablePlayerProfileCommand, 'id'>,
  ): Promise<EditablePlayerProfile> {
    const currentUser = this._user();
    if (!currentUser) {
      throw new Error('Debes iniciar sesión para editar tu perfil');
    }

    const updatedProfile = await this.updateEditablePlayerProfileUseCase.execute({
      id: currentUser.id,
      ...command,
    });
    const displayName = resolveEditablePlayerProfileDisplayName(updatedProfile);

    this.setLocalDisplayName(displayName);
    try {
      await this.persistDisplayName(displayName);
    } catch {
      // The player profile is already updated in the backend; keep the UI in sync locally.
    }

    return updatedProfile;
  }

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  clearError(): void {
    this._error.set(null);
  }

  private async hydrateAuthenticatedSession(
    session: Pick<Session, 'access_token'>,
    options: { resolveInitialSession?: boolean } = {},
  ): Promise<void> {
    this._accessToken.set(session.access_token);
    await this.loadCurrentUser();

    if (options.resolveInitialSession) {
      this.resolveInitialSession();
    }
  }

  private setUnauthenticatedState(
    options: { keepAccessToken?: boolean; resolveInitialSession?: boolean } = {},
  ): void {
    this._user.set(null);

    if (!options.keepAccessToken) {
      this._accessToken.set(null);
    }

    this._status.set('unauthenticated');

    if (options.resolveInitialSession) {
      this.resolveInitialSession();
    }
  }

  private resolveInitialSession(): void {
    if (this.initialSessionResolved) {
      return;
    }

    this.initialSessionResolved = true;
    this.initialSessionReady.resolve();
  }

  private setLocalDisplayName(displayName: string): void {
    this._user.update((user) => (user ? { ...user, displayName } : null));
  }

  private async persistDisplayName(displayName: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      data: { display_name: displayName },
    });

    if (error) {
      throw new Error(error.message);
    }
  }
}

interface Deferred<T> {
  readonly promise: Promise<T>;
  readonly resolve: (value?: T | PromiseLike<T>) => void;
}

function createDeferred<T>(): Deferred<T> {
  let resolve: Deferred<T>['resolve'] = (_value) => undefined;
  const promise = new Promise<T>((innerResolve) => {
    resolve = innerResolve as Deferred<T>['resolve'];
  });

  return { promise, resolve };
}
