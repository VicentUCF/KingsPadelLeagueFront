import { inject, Injectable } from '@angular/core';
import type { SupabaseClient, User } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@core/tokens/supabase.token';
import type { AuthUser } from '../../domain/entities/auth-user';
import type {
  AuthRepository,
  LoginCredentials,
  RegisterCredentials,
} from '../../application/ports/auth.repository';
import { mapSupabaseUserToAuthUser } from '../mappers/supabase-auth-user.mapper';

@Injectable()
export class SupabaseAuthRepository implements AuthRepository {
  private readonly supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error ?? !data.user) {
      throw new Error(error?.message ?? 'Error al iniciar sesión');
    }

    return this.mapToAuthUser(data.user);
  }

  async register(credentials: RegisterCredentials): Promise<void> {
    const { error } = await this.supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          display_name: credentials.displayName,
          role: 'user',
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async logout(): Promise<void> {
    const { error } = await this.supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data } = await this.supabase.auth.getUser();
    if (!data.user) return null;
    return this.mapToAuthUser(data.user);
  }

  private mapToAuthUser(user: User): AuthUser {
    return mapSupabaseUserToAuthUser(user);
  }
}
