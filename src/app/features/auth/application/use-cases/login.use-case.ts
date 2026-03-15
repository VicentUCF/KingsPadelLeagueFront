import { inject, Injectable } from '@angular/core';

import type { AuthUser } from '../../domain/entities/auth-user';
import { AUTH_REPOSITORY, type LoginCredentials } from '../ports/auth.repository';

@Injectable()
export class LoginUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY);

  execute(credentials: LoginCredentials): Promise<AuthUser> {
    return this.authRepository.login(credentials);
  }
}
