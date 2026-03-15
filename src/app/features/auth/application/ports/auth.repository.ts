import { InjectionToken } from '@angular/core';

import type { AuthUser } from '../../domain/entities/auth-user';

export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

export interface RegisterCredentials {
  readonly email: string;
  readonly password: string;
  readonly displayName: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthUser>;
  register(credentials: RegisterCredentials): Promise<void>;
  logout(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(newPassword: string): Promise<void>;
  getCurrentUser(): Promise<AuthUser | null>;
}

export const AUTH_REPOSITORY = new InjectionToken<AuthRepository>('AuthRepository');
