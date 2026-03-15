import { computed, inject, Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import type { AuthUser } from '../../domain/entities/auth-user';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { RegisterUseCase } from '../../application/use-cases/register.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { RequestPasswordResetUseCase } from '../../application/use-cases/request-password-reset.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/reset-password.use-case';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);
  private readonly loginUseCase = inject(LoginUseCase);
  private readonly registerUseCase = inject(RegisterUseCase);
  private readonly logoutUseCase = inject(LogoutUseCase);
  private readonly requestPasswordResetUseCase = inject(RequestPasswordResetUseCase);
  private readonly resetPasswordUseCase = inject(ResetPasswordUseCase);

  private readonly _status = signal<AuthStatus>('idle');
  private readonly _user = signal<AuthUser | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _accessToken = signal<string | null>(null);

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

    void this.supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        this._accessToken.set(data.session.access_token);
        void this.loadCurrentUser();
      } else {
        this._status.set('unauthenticated');
      }
    });

    this.supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        this._user.set(null);
        this._accessToken.set(null);
        this._status.set('unauthenticated');
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        this._accessToken.set(session.access_token);
        void this.loadCurrentUser();
      } else if (event === 'PASSWORD_RECOVERY') {
        // User arrived via password-reset link — keep unauthenticated state until they set a new password
        this._accessToken.set(session.access_token);
        this._status.set('unauthenticated');
      }
    });
  }

  private async loadCurrentUser(): Promise<void> {
    try {
      const { data } = await this.supabase.auth.getUser();
      if (!data.user) {
        this._status.set('unauthenticated');
        return;
      }

      const meta = data.user.user_metadata as Record<string, unknown>;
      const user: AuthUser = {
        id: data.user.id,
        email: data.user.email ?? '',
        displayName: (meta['display_name'] as string | undefined) ?? data.user.email ?? '',
        role: (meta['role'] as string | undefined) === 'ADMIN' ? 'ADMIN' : 'PRESIDENT',
        teamId: (meta['team_id'] as string | undefined) ?? null,
      };

      this._user.set(user);
      this._status.set('authenticated');
    } catch {
      this._status.set('unauthenticated');
    }
  }

  async login(email: string, password: string): Promise<void> {
    this._error.set(null);
    this._status.set('loading');
    try {
      const user = await this.loginUseCase.execute({ email, password });
      this._user.set(user);
      this._status.set('authenticated');
    } catch (err) {
      this._status.set('unauthenticated');
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
    this._user.set(null);
    this._status.set('unauthenticated');
  }

  async requestPasswordReset(email: string): Promise<void> {
    await this.requestPasswordResetUseCase.execute(email);
  }

  async resetPassword(newPassword: string): Promise<void> {
    await this.resetPasswordUseCase.execute(newPassword);
  }

  async updateProfile(displayName: string): Promise<void> {
    const { data, error } = await this.supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    if (error) throw new Error(error.message);
    if (data.user) {
      this._user.update((u) => (u ? { ...u, displayName } : null));
    }
  }

  async changePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  clearError(): void {
    this._error.set(null);
  }
}
