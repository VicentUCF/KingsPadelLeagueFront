import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY, type RegisterCredentials } from '../ports/auth.repository';

@Injectable()
export class RegisterUseCase {
  private readonly authRepository = inject(AUTH_REPOSITORY);

  execute(credentials: RegisterCredentials): Promise<void> {
    return this.authRepository.register(credentials);
  }
}
